import express from "express";
import {
  chatWithAssistant,
  getChatHistory,
} from "../controllers/chatController.js";

const router = express.Router();

// POST /api/chat - Send message to AI assistant
router.post("/", chatWithAssistant);

// GET /api/chat/history - Get chat history (optional)
router.get("/history", getChatHistory);

export default router;
