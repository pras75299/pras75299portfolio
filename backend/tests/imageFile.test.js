import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import { test } from "node:test";
import { hasAllowedImageSignature } from "../utils/imageFile.js";

const withTempFile = async (name, contents, run) => {
  const tempDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "portfolio-image-file-test-")
  );
  const filePath = path.join(tempDir, name);
  await fs.promises.writeFile(filePath, contents);

  try {
    await run(filePath);
  } finally {
    await fs.promises.rm(tempDir, { force: true, recursive: true });
  }
};

test("accepts png signatures", async () => {
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  await withTempFile("image.png", pngHeader, async (filePath) => {
    assert.equal(await hasAllowedImageSignature(filePath), true);
  });
});

test("rejects invalid image signatures", async () => {
  await withTempFile("fake.png", Buffer.from("not-an-image"), async (filePath) => {
    assert.equal(await hasAllowedImageSignature(filePath), false);
  });
});
