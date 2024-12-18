import express from "express";
import {
  getMessages,
  getMessageById,
  createMessage,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Get all messages
router.get("/", getMessages);

// Get a single message by ID
router.get("/:id", getMessageById);

// Create a new message
router.post("/", createMessage);

// Update message status by ID
router.patch("/:id/status", updateMessageStatus);

// Delete a message by ID
router.delete("/:id", deleteMessage);

export default router;
