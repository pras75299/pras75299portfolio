import express from "express";
import fs from "fs";
import multer from "multer";
import os from "os";
import path from "path";
import {
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectWriteController.js";
import { ensureDbConnection } from "../middleware/ensureDbConnection.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();
const uploadsDir = path.join(os.tmpdir(), "portfolio-uploads");
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
      return;
    }

    cb(null, true);
  },
});

const handleProjectUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Project image must be 5 MB or smaller."
            : "Only image uploads are allowed for project images.",
      });
    }

    if (error) {
      return next(error);
    }

    return next();
  });
};

router.use(requireAdmin);
router.use(ensureDbConnection);
router.post("/", handleProjectUpload, createProject);
router.put("/:id", handleProjectUpload, updateProject);
router.delete("/:id", deleteProject);

export default router;
