import Joi from "joi";

export const validateChatMessage = (data) => {
  const schema = Joi.object({
    message: Joi.string().min(1).max(1000).required().messages({
      "string.empty": "Message cannot be empty",
      "string.min": "Message must be at least 1 character long",
      "string.max": "Message cannot exceed 1000 characters",
      "any.required": "Message is required",
    }),
  });

  return schema.validate(data);
};
