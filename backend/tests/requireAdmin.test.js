import assert from "node:assert/strict";
import crypto from "node:crypto";
import { afterEach, beforeEach, test } from "node:test";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  createMockRequest,
  createMockResponse,
} from "./helpers/mockHttp.js";

const ADMIN_API_KEY_ID = "test-admin-primary";
const ADMIN_API_SECRET = "test-admin-primary-secret";
const ADMIN_API_SECONDARY_KEY_ID = "test-admin-secondary";
const ADMIN_API_SECONDARY_SECRET = "test-admin-secondary-secret";
const originalEnv = {
  ADMIN_API_KEY_ID: process.env.ADMIN_API_KEY_ID,
  ADMIN_API_SECRET: process.env.ADMIN_API_SECRET,
  ADMIN_API_SECONDARY_KEY_ID: process.env.ADMIN_API_SECONDARY_KEY_ID,
  ADMIN_API_SECONDARY_SECRET: process.env.ADMIN_API_SECONDARY_SECRET,
  ADMIN_API_SIGNATURE_TTL_SECONDS: process.env.ADMIN_API_SIGNATURE_TTL_SECONDS,
};
const originalDateNow = Date.now;

const createAdminAuthorizationHeader = ({
  contentLength = "",
  contentType = "",
  keyId = ADMIN_API_KEY_ID,
  method = "POST",
  path = "/api/skills",
  secret = ADMIN_API_SECRET,
  timestamp = Math.floor(Date.now() / 1000),
} = {}) => {
  const payload = [
    method.toUpperCase(),
    path,
    String(timestamp),
    contentType,
    contentLength,
  ].join("\n");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `AdminHMAC ${keyId}:${timestamp}:${signature}`;
};

const createAdminRequest = ({
  authorization,
  contentLength = "",
  contentType = "",
  method = "POST",
  path = "/api/skills",
} = {}) => {
  const req = createMockRequest({
    headers: {
      ...(authorization ? { authorization } : {}),
      ...(contentLength ? { "content-length": contentLength } : {}),
      ...(contentType ? { "content-type": contentType } : {}),
    },
  });

  req.method = method;
  req.originalUrl = path;

  return req;
};

beforeEach(() => {
  Date.now = originalDateNow;
  process.env.ADMIN_API_KEY_ID = ADMIN_API_KEY_ID;
  process.env.ADMIN_API_SECRET = ADMIN_API_SECRET;
  process.env.ADMIN_API_SECONDARY_KEY_ID = "";
  process.env.ADMIN_API_SECONDARY_SECRET = "";
  process.env.ADMIN_API_SIGNATURE_TTL_SECONDS = "300";
});

afterEach(() => {
  Date.now = originalDateNow;
  process.env.ADMIN_API_KEY_ID = originalEnv.ADMIN_API_KEY_ID;
  process.env.ADMIN_API_SECRET = originalEnv.ADMIN_API_SECRET;
  process.env.ADMIN_API_SECONDARY_KEY_ID = originalEnv.ADMIN_API_SECONDARY_KEY_ID;
  process.env.ADMIN_API_SECONDARY_SECRET = originalEnv.ADMIN_API_SECONDARY_SECRET;
  process.env.ADMIN_API_SIGNATURE_TTL_SECONDS =
    originalEnv.ADMIN_API_SIGNATURE_TTL_SECONDS;
});

test("rejects unauthorized admin requests", () => {
  const req = createAdminRequest();
  const res = createMockResponse();
  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Unauthorized" });
});

test("allows requests signed with the primary admin key", () => {
  const req = createAdminRequest({
    authorization: createAdminAuthorizationHeader(),
  });
  const res = createMockResponse();
  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.body, null);
  assert.deepEqual(req.adminAuth, {
    authenticatedAt: new Date(Math.floor(Date.now() / 1000) * 1000).toISOString(),
    keyId: ADMIN_API_KEY_ID,
  });
});

test("allows requests signed with the secondary admin key during rotation", () => {
  process.env.ADMIN_API_SECONDARY_KEY_ID = ADMIN_API_SECONDARY_KEY_ID;
  process.env.ADMIN_API_SECONDARY_SECRET = ADMIN_API_SECONDARY_SECRET;

  const req = createAdminRequest({
    authorization: createAdminAuthorizationHeader({
      keyId: ADMIN_API_SECONDARY_KEY_ID,
      secret: ADMIN_API_SECONDARY_SECRET,
    }),
  });
  const res = createMockResponse();
  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.body, null);
  assert.equal(req.adminAuth.keyId, ADMIN_API_SECONDARY_KEY_ID);
});

test("rejects stale signed requests", () => {
  const fixedNow = new Date("2026-04-26T12:00:00.000Z").valueOf();
  Date.now = () => fixedNow;
  process.env.ADMIN_API_SIGNATURE_TTL_SECONDS = "60";

  const req = createAdminRequest({
    authorization: createAdminAuthorizationHeader({
      timestamp: Math.floor(fixedNow / 1000) - 61,
    }),
  });
  const res = createMockResponse();
  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Unauthorized" });
});

test("returns 503 when admin signing credentials are not fully configured", () => {
  process.env.ADMIN_API_SECRET = "";

  const req = createAdminRequest({
    authorization: createAdminAuthorizationHeader(),
  });
  const res = createMockResponse();
  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, {
    message: "Admin operations are temporarily unavailable.",
  });
});
