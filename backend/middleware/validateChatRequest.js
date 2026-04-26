import { validateChatMessage } from "../validators/chatValidator.js";

export const validateChatRequest = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      error: "Request body is required and must be a JSON object",
    });
  }

  const { error, value } = validateChatMessage(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  req.validatedChatRequest = value;
  return next();
};
