const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
  isConnected = false;
  connectDB();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
});

module.exports = connectDB;
