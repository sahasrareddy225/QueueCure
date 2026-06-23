require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const patientRoutes = require("./routes/patients");
const queueRoutes = require("./routes/queue");
const { initSocket } = require("./sockets/socketHandler");

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const CLIENT_URL = process.env.CLIENT_URL;
if (!CLIENT_URL) {
  console.warn("⚠️  CLIENT_URL env variable is not set — CORS may block requests");
}

const allowedOrigins = CLIENT_URL
  ? [CLIENT_URL]
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // websocket first, polling as fallback
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocket(io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Queue Cure '26 Backend",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/patients", patientRoutes);
app.use("/api/queue", queueRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Queue Cure '26 backend running on port ${PORT}`);
      console.log(`📡 Socket.IO server ready`);
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
