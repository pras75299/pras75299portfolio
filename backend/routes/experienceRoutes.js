import express from "express";
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from "../controllers/experienceController.js";
import { ensureDbConnection } from "../middleware/ensureDbConnection.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Route: Get all experiences
router.get("/", ensureDbConnection, getExperiences);

// Route: Create a new experience
router.post("/", requireAdmin, ensureDbConnection, createExperience);

// Route: Update an experience by ID
router.put("/:id", requireAdmin, ensureDbConnection, updateExperience);

// Route: Delete an experience by ID
router.delete("/:id", requireAdmin, ensureDbConnection, deleteExperience);

export default router;
