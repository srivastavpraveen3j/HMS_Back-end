import mongoose from "mongoose";

export const connectToMongoDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MongoDB URI is not defined in environment variables.");
    process.exit(1); // Exit the process if no URI is provided
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Additional options can go here if needed
    });
    console.log("✅ Successfully connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit the process if unable to connect
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
  });
};
