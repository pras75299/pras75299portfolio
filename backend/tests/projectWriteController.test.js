import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import { test } from "node:test";
import { createProject } from "../controllers/projectWriteController.js";
import {
  createMockRequest,
  createMockResponse,
} from "./helpers/mockHttp.js";

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
