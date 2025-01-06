import Project from "../models/Project.js";
import { validateProject } from "../validators/projectValidator.js";
import { uploadOnCloudinary } from "../middleware/cloudinary.js";
import fs from "fs";

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { title, description, technologies, githubUrl, liveUrl, category } =
      req.body;

    // Validate the project input
    const { error } = validateProject({ ...req.body, image: "placeholder" });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let imageUrl = null;
    if (req.file) {
      const response = await uploadOnCloudinary(req.file.path);
      if (response) {
        imageUrl = response.url;
        await fs.promises.unlink(req.file.path).catch(console.error); // Remove local file
      } else {
        return res
          .status(500)
          .json({ message: "Image upload to Cloudinary failed." });
      }
    }

    const project = new Project({
      title,
      description,
      technologies: Array.isArray(technologies) ? technologies : [technologies],
      githubUrl,
      liveUrl,
      category,
      image: imageUrl,
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    if (req.file) await fs.promises.unlink(req.file.path).catch(console.error); // Clean up file on error
    res.status(500).json({ message: error.message });
  }
};

// Update an existing project
export const updateProject = async (req, res) => {
  try {
    const { title, description, technologies, githubUrl, liveUrl, category } =
      req.body;

    // Validate the project input
    const { error } = validateProject({ ...req.body, image: "placeholder" });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let imageUrl = null;
    if (req.file) {
      const response = await uploadOnCloudinary(req.file.path);
      if (response) {
        imageUrl = response.url;
        await fs.promises.unlink(req.file.path).catch(console.error); // Remove local file
      } else {
        return res
          .status(500)
          .json({ message: "Image upload to Cloudinary failed." });
      }
    }

    const updatedData = {
      title,
      description,
      technologies: Array.isArray(technologies) ? technologies : [technologies],
      githubUrl,
      liveUrl,
      category,
    };

    if (imageUrl) updatedData.image = imageUrl;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!project)
      return res.status(404).json({ message: "Project not found." });

    res.json(project);
  } catch (error) {
    if (req.file) await fs.promises.unlink(req.file.path).catch(console.error); // Clean up file on error
    res.status(500).json({ message: error.message });
  }
};

// Delete a project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project)
      return res.status(404).json({ message: "Project not found." });
    res.json({ message: "Project deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
