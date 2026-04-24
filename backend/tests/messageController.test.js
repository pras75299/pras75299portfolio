import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import Message from "../models/Message.js";
import { updateMessageStatus } from "../controllers/messageController.js";
import {
  createMockRequest,
  createMockResponse,
} from "./helpers/mockHttp.js";

afterEach(() => {
  mock.restoreAll();
});

test("updates message status for valid requests", async () => {
  mock.method(Message, "findByIdAndUpdate", async (id, payload) => ({
    _id: id,
    status: payload.status,
  }));

  const req = createMockRequest({
    body: { status: "read" },
    params: { id: "507f1f77bcf86cd799439011" },
  });
  const res = createMockResponse();

  await updateMessageStatus(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    _id: "507f1f77bcf86cd799439011",
    status: "read",
  });
});

test("returns 400 for malformed ids when updating message status", async () => {
  const castError = new Error("Cast to ObjectId failed");
  castError.name = "CastError";
  mock.method(Message, "findByIdAndUpdate", async () => {
    throw castError;
  });

  const req = createMockRequest({
    body: { status: "read" },
    params: { id: "not-an-id" },
  });
  const res = createMockResponse();

  await updateMessageStatus(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    message: "The provided identifier is invalid.",
  });
});
