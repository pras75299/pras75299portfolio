import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import Experience from "../models/Experience.js";
import { updateExperience } from "../controllers/experienceController.js";
import {
  createMockRequest,
  createMockResponse,
} from "./helpers/mockHttp.js";

afterEach(() => {
  mock.restoreAll();
});

test("updates experiences for valid requests", async () => {
  mock.method(Experience, "findByIdAndUpdate", async (id, payload) => ({
    _id: id,
    ...payload,
  }));

  const req = createMockRequest({
    body: {
      company: "Example Co",
      current: true,
      description: ["Built systems"],
      location: "Remote",
      startDate: "2024-01-01",
      technologies: ["Node.js", "React"],
      title: "Engineer",
    },
    params: { id: "507f1f77bcf86cd799439011" },
  });
  const res = createMockResponse();

  await updateExperience(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    _id: "507f1f77bcf86cd799439011",
    company: "Example Co",
    current: true,
    description: ["Built systems"],
    location: "Remote",
    startDate: "2024-01-01",
    technologies: ["Node.js", "React"],
    title: "Engineer",
  });
});

test("returns 400 for malformed ids when updating experiences", async () => {
  const castError = new Error("Cast to ObjectId failed");
  castError.name = "CastError";
  mock.method(Experience, "findByIdAndUpdate", async () => {
    throw castError;
  });

  const req = createMockRequest({
    body: {
      company: "Example Co",
      current: true,
      description: ["Built systems"],
      location: "Remote",
      startDate: "2024-01-01",
      technologies: ["Node.js", "React"],
      title: "Engineer",
    },
    params: { id: "not-an-id" },
  });
  const res = createMockResponse();

  await updateExperience(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    message: "The provided identifier is invalid.",
  });
});
