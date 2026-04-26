import express from "express";
import { getProjects } from "../controllers/projectReadController.js";
import { ensureDbConnection } from "../middleware/ensureDbConnection.js";

const router = express.Router();

router.get("/", ensureDbConnection, getProjects);

export default router;
