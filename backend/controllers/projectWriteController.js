import fs from "fs";
import Project from "../models/Project.js";
import { uploadOnCloudinary } from "../middleware/cloudinary.js";
import { getClientErrorResponse } from "../utils/clientError.js";
import { hasAllowedImageSignature } from "../utils/imageFile.js";
import { logServerError, sendServerError } from "../utils/serverError.js";
import { validateProject } from "../validators/projectValidator.js";

const removeUploadedFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  await fs.promises.unlink(filePath).catch(console.error);
};

export const createProject = async (req, res) => {
  try {
    const { error, value } = validateProject(req.body, {
      requireImage: true,
      hasImageFile: Boolean(req.file),
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, technologies, githubUrl, liveUrl, category } =
      value;

    let imageUrl = null;
    if (req.file) {
      const hasValidSignature = await hasAllowedImageSignature(req.file.path);
      if (!hasValidSignature) {
        await removeUploadedFile(req.file.path);
        return res.status(400).json({
          message: "Uploaded files must contain a valid image.",
        });
      }

      const response = await uploadOnCloudinary(req.file.path);
      if (response) {
        imageUrl = response.url;
        await removeUploadedFile(req.file.path);
      } else {
        return res
          .status(500)
          .json({ message: "Image upload to Cloudinary failed." });
      }
    }

    const project = new Project({
      title,
      description,
      technologies,
      githubUrl,
      liveUrl,
      category,
      image: imageUrl,
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    await removeUploadedFile(req.file?.path);

    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to create project", error);
    return sendServerError(res, "Unable to save the project right now.");
  }
};

export const updateProject = async (req, res) => {
  try {
    const { error, value } = validateProject(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, technologies, githubUrl, liveUrl, category } =
      value;

    let imageUrl = null;
    if (req.file) {
      const hasValidSignature = await hasAllowedImageSignature(req.file.path);
      if (!hasValidSignature) {
        await removeUploadedFile(req.file.path);
        return res.status(400).json({
          message: "Uploaded files must contain a valid image.",
        });
      }

      const response = await uploadOnCloudinary(req.file.path);
      if (response) {
        imageUrl = response.url;
        await removeUploadedFile(req.file.path);
      } else {
        return res
          .status(500)
          .json({ message: "Image upload to Cloudinary failed." });
      }
    }

    const updatedData = {
      title,
      description,
      technologies,
      githubUrl,
      liveUrl,
      category,
    };

    if (imageUrl) updatedData.image = imageUrl;

    const project = await Project.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.json(project);
  } catch (error) {
    await removeUploadedFile(req.file?.path);

    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to update project", error);
    return sendServerError(res, "Unable to update the project right now.");
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.json({ message: "Project deleted successfully." });
  } catch (error) {
    const clientError = getClientErrorResponse(error);
    if (clientError) {
      return res.status(clientError.status).json({ message: clientError.message });
    }

    logServerError("Failed to delete project", error);
    return sendServerError(res, "Unable to delete the project right now.");
  }
};
