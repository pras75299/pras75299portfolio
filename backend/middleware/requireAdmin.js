import crypto from "crypto";

const AUTHORIZATION_SCHEME = "AdminHMAC";
const DEFAULT_SIGNATURE_TTL_SECONDS = 300;
const SIGNATURE_PATTERN = /^[a-f0-9]{64}$/i;
const KEY_ID_PATTERN = /^[A-Za-z0-9._-]+$/;
const SERVICE_UNAVAILABLE_RESPONSE = {
  message: "Admin operations are temporarily unavailable.",
};
const UNAUTHORIZED_RESPONSE = {
  message: "Unauthorized",
};

const parseAuthorizationHeader = (authorizationHeader = "") => {
  const match = authorizationHeader.match(/^(\S+)\s+(\S+)$/);
  if (!match) {
    return null;
  }

  const [, scheme, credentials] = match;
  if (scheme !== AUTHORIZATION_SCHEME) {
    return null;
  }

  const [keyId, unixTimestamp, signature, ...rest] = credentials.split(":");
  if (rest.length > 0 || !keyId || !unixTimestamp || !signature) {
    return null;
  }

  if (!KEY_ID_PATTERN.test(keyId) || !SIGNATURE_PATTERN.test(signature)) {
    return null;
  }

  const parsedTimestamp = Number.parseInt(unixTimestamp, 10);
  if (!Number.isInteger(parsedTimestamp) || parsedTimestamp <= 0) {
    return null;
  }

  return {
    keyId,
    signature: signature.toLowerCase(),
    timestamp: parsedTimestamp,
  };
};

const signaturesMatch = (expectedSignature, providedSignature) => {
  const expected = Buffer.from(expectedSignature, "utf8");
  const provided = Buffer.from(providedSignature, "utf8");

  if (expected.length !== provided.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, provided);
};

const buildSigningPayload = (req, timestamp) =>
  [
    req.method?.toUpperCase() || "",
    req.originalUrl || req.url || "",
    String(timestamp),
    String(req.headers["content-type"] || "").trim(),
    String(req.headers["content-length"] || "").trim(),
  ].join("\n");

const createSignature = (secret, payload) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

const resolveSignatureTtlSeconds = () => {
  const rawValue = process.env.ADMIN_API_SIGNATURE_TTL_SECONDS?.trim();
  if (!rawValue) {
    return DEFAULT_SIGNATURE_TTL_SECONDS;
  }

  const ttlSeconds = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
    console.error(
      "ADMIN_API_SIGNATURE_TTL_SECONDS must be a positive integer"
    );
    return null;
  }

  return ttlSeconds;
};

const resolveSigningKeys = () => {
  const primaryKeyId = process.env.ADMIN_API_KEY_ID?.trim();
  const primarySecret = process.env.ADMIN_API_SECRET?.trim();
  const secondaryKeyId = process.env.ADMIN_API_SECONDARY_KEY_ID?.trim();
  const secondarySecret = process.env.ADMIN_API_SECONDARY_SECRET?.trim();

  if (!primaryKeyId || !primarySecret) {
    console.error("ADMIN_API_KEY_ID and ADMIN_API_SECRET must be configured");
    return null;
  }

  if ((secondaryKeyId && !secondarySecret) || (!secondaryKeyId && secondarySecret)) {
    console.error(
      "ADMIN_API_SECONDARY_KEY_ID and ADMIN_API_SECONDARY_SECRET must be configured together"
    );
    return null;
  }

  const keyEntries = [[primaryKeyId, primarySecret]];
  if (secondaryKeyId && secondarySecret) {
    keyEntries.push([secondaryKeyId, secondarySecret]);
  }

  return new Map(keyEntries);
};

const isTimestampWithinWindow = (timestamp, ttlSeconds, now = Date.now()) => {
  const nowSeconds = Math.floor(now / 1000);
  return Math.abs(nowSeconds - timestamp) <= ttlSeconds;
};

export const requireAdmin = (req, res, next) => {
  const signingKeys = resolveSigningKeys();
  const signatureTtlSeconds = resolveSignatureTtlSeconds();
  if (!signingKeys || signatureTtlSeconds === null) {
    return res.status(503).json(SERVICE_UNAVAILABLE_RESPONSE);
  }

  const authorization = parseAuthorizationHeader(req.headers.authorization);
  if (!authorization) {
    return res.status(401).json(UNAUTHORIZED_RESPONSE);
  }

  const signingSecret = signingKeys.get(authorization.keyId);
  if (!signingSecret) {
    return res.status(401).json(UNAUTHORIZED_RESPONSE);
  }

  if (!isTimestampWithinWindow(authorization.timestamp, signatureTtlSeconds)) {
    return res.status(401).json(UNAUTHORIZED_RESPONSE);
  }

  const expectedSignature = createSignature(
    signingSecret,
    buildSigningPayload(req, authorization.timestamp)
  );
  if (!signaturesMatch(expectedSignature, authorization.signature)) {
    return res.status(401).json(UNAUTHORIZED_RESPONSE);
  }

  req.adminAuth = {
    authenticatedAt: new Date(authorization.timestamp * 1000).toISOString(),
    keyId: authorization.keyId,
  };

  return next();
};
