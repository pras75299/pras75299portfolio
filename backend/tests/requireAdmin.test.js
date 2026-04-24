import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  createMockRequest,
  createMockResponse,
} from "./helpers/mockHttp.js";

const ADMIN_TOKEN = "test-admin-token";
const originalAdminToken = process.env.ADMIN_API_TOKEN;

beforeEach(() => {
  process.env.ADMIN_API_TOKEN = ADMIN_TOKEN;
});

afterEach(() => {
  process.env.ADMIN_API_TOKEN = originalAdminToken;
});

test("rejects unauthorized admin requests", () => {
  const req = createMockRequest();
  const res = createMockResponse();
  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Unauthorized" });
});

test("allows authorized admin requests", () => {
  const req = createMockRequest({
    headers: {
      authorization: `Bearer ${ADMIN_TOKEN}`,
    },
  });
  const res = createMockResponse();
  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.body, null);
});
