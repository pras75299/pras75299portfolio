import Experience from "../models/Experience.js";
import { validateExperience } from "../validators/experienceValidator.js";

// Get all experiences
export const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ startDate: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};
