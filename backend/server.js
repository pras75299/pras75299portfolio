import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import { connectDB } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import projectRoutes from "./routes/projectRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

config();

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB (handle errors gracefully for serverless)
connectDB().catch((error) => {
  console.error("MongoDB connection error:", error);
  // Don't exit in serverless environment
  if (process.env.VERCEL !== "1") {
    process.exit(1);
  }
});

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://codexprashantsingh.netlify.app",
      "https://codexprashantsingh.vercel.app",
      "http://localhost:5173",
    ],
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
app.use(morgan("dev"));
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

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageRoutes);
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

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
