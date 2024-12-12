import Joi from 'joi';

export const validateProject = (project) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required(),
    technologies: Joi.array().items(Joi.string()).required(),
    githubUrl: Joi.string().required(),
    liveUrl: Joi.string().required(),
    category: Joi.string().required()
  });

  return schema.validate(project);
};