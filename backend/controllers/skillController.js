import Skill from "../models/Skill.js";
import { validateSkill } from "../validators/skillValidator.js";
import { setPortfolioReadCacheHeaders } from "../utils/cacheHeaders.js";
import { getClientErrorResponse } from "../utils/clientError.js";
import { logServerError, sendServerError } from "../utils/serverError.js";

export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find()
      .sort({ createdAt: -1 })
      .select("name icon")
      .lean();
    setPortfolioReadCacheHeaders(res);
    res.json(skills);
  } catch (error) {
    logServerError("Failed to fetch skills", error);
    sendServerError(res, "Unable to load skills right now.");
  }
};

export const createSkill = async (req, res) => {
  try {
    const { error } = validateSkill(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const skill = new Skill(req.body);
    const savedSkill = await skill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to create skill", error);
    return sendServerError(res, "Unable to save the skill right now.");
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { error } = validateSkill(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!skill) return res.status(404).json({ message: "Skill not found" });

    res.json(skill);
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to update skill", error);
    return sendServerError(res, "Unable to update the skill right now.");
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to delete skill", error);
    return sendServerError(res, "Unable to delete the skill right now.");
  }
};
