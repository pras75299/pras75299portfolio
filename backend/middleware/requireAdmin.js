import crypto from "crypto";

const getBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token.trim();
};

const tokensMatch = (expectedToken, providedToken) => {
  const expected = Buffer.from(expectedToken);
  const provided = Buffer.from(providedToken);

  if (expected.length !== provided.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, provided);
};

export const requireAdmin = (req, res, next) => {
  const adminToken = process.env.ADMIN_API_TOKEN?.trim();
  if (!adminToken) {
    console.error("ADMIN_API_TOKEN is not configured");
    return res.status(503).json({
      message: "Admin operations are temporarily unavailable.",
    });
  }

  const providedToken = getBearerToken(req.headers.authorization);
  if (!providedToken || !tokensMatch(adminToken, providedToken)) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  return next();
};
