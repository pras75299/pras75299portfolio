import express from "express";
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from "../controllers/experienceController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Route: Get all experiences
router.get("/", getExperiences);

// Route: Create a new experience
router.post("/", requireAdmin, createExperience);

// Route: Update an experience by ID
router.put("/:id", requireAdmin, updateExperience);

// Route: Delete an experience by ID
router.delete("/:id", requireAdmin, deleteExperience);

export default router;
