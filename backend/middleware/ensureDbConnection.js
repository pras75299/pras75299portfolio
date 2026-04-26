import { connectDB } from "../config/database.js";

export const ensureDbConnection = async (req, res, next) => {
  const connect = req.app.locals.connectDB ?? connectDB;

  try {
    await connect();
    return next();
  } catch (error) {
    console.error("DB connection failed on request:", error.message);
    return res.status(503).json({ message: "Database unavailable" });
  }
};
