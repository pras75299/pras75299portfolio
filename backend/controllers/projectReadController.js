import Project from "../models/Project.js";
import { setPortfolioReadCacheHeaders } from "../utils/cacheHeaders.js";
import { logServerError, sendServerError } from "../utils/serverError.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .select("title image technologies githubUrl liveUrl category")
      .lean();

    setPortfolioReadCacheHeaders(res);
    res.json(projects);
  } catch (error) {
    logServerError("Failed to fetch projects", error);
    sendServerError(res, "Unable to load projects right now.");
  }
};
