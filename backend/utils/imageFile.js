import fs from "fs";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const GIF87A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
const GIF89A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];

const startsWithBytes = (buffer, signature, offset = 0) =>
  signature.every((byte, index) => buffer[offset + index] === byte);

export const hasAllowedImageSignature = async (filePath) => {
  if (!filePath) {
    return false;
  }

  const fileHandle = await fs.promises.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await fileHandle.read(buffer, 0, buffer.length, 0);
    const header = buffer.subarray(0, bytesRead);

    return (
      startsWithBytes(header, PNG_SIGNATURE) ||
      startsWithBytes(header, JPEG_SIGNATURE) ||
      startsWithBytes(header, GIF87A_SIGNATURE) ||
      startsWithBytes(header, GIF89A_SIGNATURE) ||
      (startsWithBytes(header, RIFF_SIGNATURE) &&
        startsWithBytes(header, WEBP_SIGNATURE, 8))
    );
  } finally {
    await fileHandle.close();
  }
};
