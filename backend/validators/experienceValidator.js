import Joi from "joi";

export const validateExperience = (experience) => {
  const schema = Joi.object({
    title: Joi.string().required().trim(),
    company: Joi.string().required().trim(),
    location: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().allow(null),
    current: Joi.boolean().default(false),
    description: Joi.array().items(Joi.string().required()).required(),
    technologies: Joi.array().items(Joi.string().required()).required(),
  });

  return schema.validate(experience);
};
