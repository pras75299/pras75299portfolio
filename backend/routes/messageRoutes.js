import express from "express";
import {
  getMessages,
  getMessageById,
  createMessage,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/messageController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Get all messages
router.get("/", requireAdmin, getMessages);

// Get a single message by ID
router.get("/:id", requireAdmin, getMessageById);

// Create a new message
router.post("/", createMessage);

// Update message status by ID
router.patch("/:id/status", requireAdmin, updateMessageStatus);

// Delete a message by ID
router.delete("/:id", requireAdmin, deleteMessage);

export default router;
