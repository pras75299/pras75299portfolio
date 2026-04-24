import Skill from "../models/Skill.js";
import { validateSkill } from "../validators/skillValidator.js";
import { setCollectionCacheHeaders } from "../utils/cacheHeaders.js";

export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find()
      .sort({ createdAt: -1 })
      .select("name icon")
      .lean();
    setCollectionCacheHeaders(res, {
      sMaxAge: 86400,
      staleWhileRevalidate: 3600,
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
