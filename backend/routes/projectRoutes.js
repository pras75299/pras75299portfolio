import express from "express";
import projectReadRoutes from "./projectReadRoutes.js";
import projectWriteRoutes from "./projectWriteRoutes.js";

const router = express.Router();

router.use(projectReadRoutes);
router.use(projectWriteRoutes);

export default router;
