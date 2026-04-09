import mongoose from "mongoose";

/** Mongoose readyState: 0 disconnected, 1 connected */
const READY_CONNECTED = 1;

let connectInFlight = null;

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

export const connectDB = async () => {
  if (mongoose.connection.readyState === READY_CONNECTED) {
    return;
  }

  if (connectInFlight) {
    await connectInFlight;
    return;
  }

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  connectInFlight = mongoose
    .connect(uri, options)
    .then(() => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    })
    .finally(() => {
      connectInFlight = null;
    });

  try {
    await connectInFlight;
  } catch (error) {
    console.error(`MongoDB connect failed: ${error.message}`);
    if (process.env.VERCEL !== "1") {
      process.exit(1);
      return;
    }
    throw error;
  }
};
