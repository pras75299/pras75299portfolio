import express from "express";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skillController.js";
import { ensureDbConnection } from "../middleware/ensureDbConnection.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Route: Get all skills
router.get("/", ensureDbConnection, getSkills);

// Route: Create a new skill
router.post("/", requireAdmin, ensureDbConnection, createSkill);

// Route: Update a skill by ID
router.put("/:id", requireAdmin, ensureDbConnection, updateSkill);

// Route: Delete a skill by ID
router.delete("/:id", requireAdmin, ensureDbConnection, deleteSkill);

export default router;
