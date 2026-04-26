import express from "express";
import {
  chatWithAssistant,
  getChatHistory,
} from "../controllers/chatController.js";
import { ensureDbConnection } from "../middleware/ensureDbConnection.js";
import { validateChatRequest } from "../middleware/validateChatRequest.js";

const router = express.Router();

router.get("/", getChatHistory);

// POST /api/chat - Send message to AI assistant
router.post("/", validateChatRequest, ensureDbConnection, chatWithAssistant);

// GET /api/chat/history - Get chat history (optional)
router.get("/history", getChatHistory);

export default router;
