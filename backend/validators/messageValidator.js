import Joi from "joi";

export const validateMessage = (message) => {
  const schema = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    message: Joi.string().required(),
  });

  return schema.validate(message);
};

export const validateMessageStatus = (payload) => {
  const schema = Joi.object({
    status: Joi.string().valid("unread", "read", "replied").required(),
  });

  return schema.validate(payload);
};
