import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, mock, test } from "node:test";
import {
  createProject,
  updateProject,
} from "../controllers/projectWriteController.js";
import Project from "../models/Project.js";
import {
  createMockRequest,
  createMockResponse,
} from "./helpers/mockHttp.js";

afterEach(() => {
  mock.restoreAll();
});

test("returns a precise 400 when creating a project without an image upload", async () => {
  const saveMock = mock.method(Project.prototype, "save", async () => ({
    _id: "should-not-save",
  }));

  const req = createMockRequest({
    body: {
      title: "Portfolio Project",
      description: "Demo project",
      technologies: ["React", "Node.js"],
      githubUrl: "https://github.com/example/repo",
      liveUrl: "https://example.com",
      category: "Web",
    },
  });
  const res = createMockResponse();

  await createProject(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    message: "Project image is required.",
  });
  assert.equal(saveMock.mock.callCount(), 0);
});

test("rejects spoofed image uploads before Cloudinary upload", async () => {
  const tempDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "portfolio-upload-test-")
  );
  const filePath = path.join(tempDir, "fake.png");
  await fs.promises.writeFile(filePath, "this is not a real png");

  const req = createMockRequest({
    body: {
      title: "Portfolio Project",
      description: "Demo project",
      technologies: ["React", "Node.js"],
      githubUrl: "https://github.com/example/repo",
      liveUrl: "https://example.com",
      category: "Web",
    },
    file: {
      path: filePath,
    },
  });
  const res = createMockResponse();

  await createProject(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    message: "Uploaded files must contain a valid image.",
  });
  await assert.rejects(fs.promises.access(filePath));
  await fs.promises.rm(tempDir, { force: true, recursive: true });
});

test("updates projects without requiring a new image upload", async () => {
  const updateMock = mock.method(Project, "findByIdAndUpdate", async (id, payload) => ({
    _id: id,
    ...payload,
  }));

  const req = createMockRequest({
    body: {
      title: "  Portfolio Project  ",
      description: "Demo project",
      technologies: "React",
      githubUrl: "https://github.com/example/repo",
      liveUrl: "https://example.com",
      category: "Web",
    },
    params: { id: "507f1f77bcf86cd799439011" },
  });
  const res = createMockResponse();

  await updateProject(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    _id: "507f1f77bcf86cd799439011",
    title: "Portfolio Project",
    description: "Demo project",
    technologies: ["React"],
    githubUrl: "https://github.com/example/repo",
    liveUrl: "https://example.com",
    category: "Web",
  });
  assert.equal(updateMock.mock.callCount(), 1);
  assert.equal(
    updateMock.mock.calls[0].arguments[1].image,
    undefined
  );
});
