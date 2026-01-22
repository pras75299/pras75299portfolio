import mongoose from 'mongoose';

let cachedConnection = null;

export const connectDB = async () => {
  // Return cached connection if available (for serverless)
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't exit in serverless environment
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    }
    throw error;
  }
};