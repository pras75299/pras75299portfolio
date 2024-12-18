import express from "express";
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from "../controllers/experienceController.js";

const router = express.Router();

// Route: Get all experiences
router.get("/", getExperiences);

// Route: Create a new experience
router.post("/", createExperience);

// Route: Update an experience by ID
router.put("/:id", updateExperience);

// Route: Delete an experience by ID
router.delete("/:id", deleteExperience);

export default router;
