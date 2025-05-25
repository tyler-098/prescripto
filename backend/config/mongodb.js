import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;

    if (!dbUri) {
      throw new Error("Missing MONGODB_URI in environment variables");
    }

    await mongoose.connect(dbUri, {
      dbName: "prescripto", // Specify DB name here instead of appending to URI
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connection state: connected");
  });
};

export default connectDB;
