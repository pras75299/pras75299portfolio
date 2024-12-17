import Joi from "joi";

export const validateSkill = (skill) => {
  const schema = Joi.object({
    name: Joi.string().required().trim(),
    category: Joi.string()
      .valid("frontend", "backend", "database", "devops", "other")
      .required(),
    icon: Joi.string().uri().required(),
    proficiency: Joi.number().min(1).max(100).required(),
  });

  return schema.validate(skill);
};
