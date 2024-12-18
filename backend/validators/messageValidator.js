import Joi from "joi";

export const validateMessage = (message) => {
  const schema = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    message: Joi.string().required(),
    status: Joi.string().valid("unread", "read", "replied").default("unread"),
  });

  return schema.validate(message);
};
