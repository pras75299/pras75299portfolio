import express from "express";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Route: Get all skills
router.get("/", getSkills);

// Route: Create a new skill
router.post("/", requireAdmin, createSkill);

// Route: Update a skill by ID
router.put("/:id", requireAdmin, updateSkill);

// Route: Delete a skill by ID
router.delete("/:id", requireAdmin, deleteSkill);

export default router;
