import Experience from "../models/Experience.js";
import { validateExperience } from "../validators/experienceValidator.js";
import { setPortfolioReadCacheHeaders } from "../utils/cacheHeaders.js";
import { getClientErrorResponse } from "../utils/clientError.js";
import { logServerError, sendServerError } from "../utils/serverError.js";

// Get all experiences
export const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find()
      .sort({ startDate: -1 })
      .select("title company startDate endDate current description technologies")
      .lean();
    setPortfolioReadCacheHeaders(res);
    res.json(experiences);
  } catch (error) {
    logServerError("Failed to fetch experiences", error);
    sendServerError(res, "Unable to load experiences right now.");
  }
};

// Create a new experience
export const createExperience = async (req, res) => {
  try {
    const { error } = validateExperience(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const experience = new Experience(req.body);
    const savedExperience = await experience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to create experience", error);
    return sendServerError(res, "Unable to save the experience right now.");
  }
};

// Update an experience by ID
export const updateExperience = async (req, res) => {
  try {
    const { error } = validateExperience(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!experience)
      return res.status(404).json({ message: "Experience not found" });

    res.json(experience);
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to update experience", error);
    return sendServerError(res, "Unable to update the experience right now.");
  }
};

// Delete an experience by ID
export const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);

    if (!experience)
      return res.status(404).json({ message: "Experience not found" });

    res.json({ message: "Experience deleted successfully" });
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to delete experience", error);
    return sendServerError(res, "Unable to delete the experience right now.");
  }
};
