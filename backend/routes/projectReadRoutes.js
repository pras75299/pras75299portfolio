import express from "express";
import { getProjects } from "../controllers/projectReadController.js";

const router = express.Router();

router.get("/", getProjects);

export default router;
