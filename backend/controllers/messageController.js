import Message from "../models/Message.js";
import {
  validateMessage,
  validateMessageStatus,
} from "../validators/messageValidator.js";
import { getClientErrorResponse } from "../utils/clientError.js";
import { logServerError, sendServerError } from "../utils/serverError.js";

// Get all messages
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    logServerError("Failed to fetch messages", error);
    sendServerError(res, "Unable to load messages right now.");
  }
};

// Get a message by ID
export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json(message);
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to fetch message", error);
    return sendServerError(res, "Unable to load the message right now.");
  }
};

// Create a new message
export const createMessage = async (req, res) => {
  try {
    const { error } = validateMessage(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const message = new Message({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    });
    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to create message", error);
    return sendServerError(res, "Unable to send the message right now.");
  }
};

// Update message status by ID
export const updateMessageStatus = async (req, res) => {
  try {
    const { error, value } = validateMessageStatus(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: value.status },
      { new: true }
    );

    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json(message);
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to update message status", error);
    return sendServerError(res, "Unable to update the message right now.");
  }
};

// Delete a message by ID
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to delete message", error);
    return sendServerError(res, "Unable to delete the message right now.");
  }
};
