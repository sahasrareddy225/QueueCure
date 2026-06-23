import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns a singleton Socket.IO client connected to the backend.
 * Must only be called on the client side (use in useEffect or event handlers).
 */
export const getSocket = (): Socket => {
  if (!socket) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_URL environment variable is not set. " +
          "Please set it to your backend Render URL."
      );
    }

    socket = io(apiUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️  Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socket.on("reconnect", (attempt) => {
      console.log(`🔄 Socket reconnected after ${attempt} attempt(s)`);
    });
  }

  return socket;
};

/**
 * Disconnect and destroy the socket (for cleanup)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
