import express from "express";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController.js";

const router = express.Router();

// Route: Get all skills
router.get("/", getSkills);

// Route: Create a new skill
router.post("/", createSkill);

// Route: Update a skill by ID
router.put("/:id", updateSkill);

// Route: Delete a skill by ID
router.delete("/:id", deleteSkill);

export default router;
