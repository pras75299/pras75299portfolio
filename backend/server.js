import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import { connectDB } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import projectRoutes from "./routes/projectRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

config();

const PORT = process.env.PORT || 8080;
const JSON_BODY_LIMIT = "256kb";
const isTestEnvironment = process.env.NODE_ENV === "test";

export const createApp = ({
  connectDBImpl = connectDB,
  warmupOnBoot = process.env.DB_WARMUP_ON_BOOT === "1",
} = {}) => {
  const app = express();
  app.locals.connectDB = connectDBImpl;

  // Rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });

  // Middleware
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));
  const defaultCorsOrigins = [
    "https://codexprashantsingh.vercel.app",
    "https://codexprashantsingh.netlify.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];
  const extraOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedCorsOrigins = new Set([...defaultCorsOrigins, ...extraOrigins]);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedCorsOrigins.has(origin)) return callback(null, true);
        callback(null, false);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }
  app.use(limiter);

  // Content-Type headers
  app.use((req, res, next) => {
    if (
      req.url.endsWith(".js") ||
      req.url.endsWith(".tsx") ||
      req.url.endsWith(".ts")
    ) {
      res.setHeader("Content-Type", "application/javascript");
    }
    next();
  });

  // Optional DB warmup for environments that prefer eager initialization.
  if (warmupOnBoot) {
    void connectDBImpl().catch((error) => {
      console.error("Background DB warmup failed:", error.message);
    });
  }

  // Routes
  app.use("/api/projects", projectRoutes);
  app.use("/api/experiences", experienceRoutes);
  app.use("/api/skills", skillRoutes);
  app.use("/api/chat", chatRoutes);

  // Health check route
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/", (req, res) => {
    res.send("Backend working fine");
  });

  // 404 handler for undefined routes (must be before error handler)
  app.use((req, res, next) => {
    res.status(404).json({
      error: "Route not found",
      path: req.path,
      method: req.method,
    });
  });

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
};

const app = createApp();

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== "1" && !isTestEnvironment) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    void connectDB().catch((error) => {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    });
  });
}

export default app;
