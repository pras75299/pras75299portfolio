import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import Skill from "../models/Skill.js";
import { updateSkill } from "../controllers/skillController.js";
import {
  createMockRequest,
  createMockResponse,
} from "./helpers/mockHttp.js";

afterEach(() => {
  mock.restoreAll();
});

test("updates skills for valid requests", async () => {
  mock.method(Skill, "findByIdAndUpdate", async (id, payload) => ({
    _id: id,
    ...payload,
  }));

  const req = createMockRequest({
    body: {
      category: "frontend",
      icon: "https://example.com/react.svg",
      name: "React",
      proficiency: 95,
    },
    params: { id: "507f1f77bcf86cd799439011" },
  });
  const res = createMockResponse();

  await updateSkill(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    _id: "507f1f77bcf86cd799439011",
    category: "frontend",
    icon: "https://example.com/react.svg",
    name: "React",
    proficiency: 95,
  });
});

test("returns 400 for malformed ids when updating skills", async () => {
  const castError = new Error("Cast to ObjectId failed");
  castError.name = "CastError";
  mock.method(Skill, "findByIdAndUpdate", async () => {
    throw castError;
  });

  const req = createMockRequest({
    body: {
      category: "frontend",
      icon: "https://example.com/react.svg",
      name: "React",
      proficiency: 95,
    },
    params: { id: "not-an-id" },
  });
  const res = createMockResponse();

  await updateSkill(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    message: "The provided identifier is invalid.",
  });
});
