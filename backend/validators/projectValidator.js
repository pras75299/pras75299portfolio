import Joi from "joi";

const requiredTextField = (label, maxLength) =>
  Joi.string().trim().min(1).max(maxLength).required().messages({
    "any.required": `${label} is required.`,
    "string.base": `${label} must be a string.`,
    "string.empty": `${label} is required.`,
    "string.max": `${label} must be ${maxLength} characters or fewer.`,
    "string.min": `${label} is required.`,
  });

const requiredUrlField = (label) =>
  Joi.string()
    .trim()
    .uri({ scheme: ["http", "https"] })
    .required()
    .messages({
      "any.required": `${label} is required.`,
      "string.base": `${label} must be a string.`,
      "string.empty": `${label} is required.`,
      "string.uri": `${label} must be a valid http or https URL.`,
    });

const technologyItemSchema = Joi.string().trim().min(1).max(64).messages({
  "string.base": "Each technology must be a string.",
  "string.empty": "Technology names cannot be empty.",
  "string.max": "Technology names must be 64 characters or fewer.",
  "string.min": "Technology names cannot be empty.",
});

const projectSchema = Joi.object({
  title: requiredTextField("Title", 120),
  description: requiredTextField("Description", 5000),
  technologies: Joi.array()
    .items(technologyItemSchema)
    .single()
    .min(1)
    .required()
    .messages({
      "any.required": "Technologies are required.",
      "array.base": "Technologies must be a list of strings.",
      "array.includesRequiredUnknowns": "Technologies are required.",
      "array.min": "At least one technology is required.",
    }),
  githubUrl: requiredUrlField("GitHub URL"),
  liveUrl: requiredUrlField("Live URL"),
  category: requiredTextField("Category", 80),
});

export const validateProject = (
  project,
  { requireImage = false, hasImageFile = false } = {}
) => {
  const validation = projectSchema.validate(project, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (validation.error) {
    return validation;
  }

  if (requireImage && !hasImageFile) {
    return {
      value: validation.value,
      error: {
        details: [{ message: "Project image is required." }],
      },
    };
  }

  return validation;
};
