let _io = null;

/**
 * Initialize socket handler — attach to Socket.IO server instance
 * @param {import("socket.io").Server} io
 */
const initSocket = (io) => {
  _io = io;

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} — reason: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`⚠️  Socket error from ${socket.id}:`, error);
    });
  });
};

/**
 * Emit queue_updated event to all connected clients
 * @param {Object} payload - { queue, avgTime }
 */
const emitQueueUpdate = (payload) => {
  if (_io) {
    _io.emit("queue_updated", payload);
  }
};

/**
 * Emit current_token_changed event to all connected clients
 * @param {Object} payload - { currentPatient, queue, avgTime }
 */
const emitCurrentToken = (payload) => {
  if (_io) {
    _io.emit("current_token_changed", payload);
  }
};

/**
 * Emit patient_added event to all connected clients
 * @param {Object} patient
 */
const emitPatientAdded = (patient) => {
  if (_io) {
    _io.emit("patient_added", patient);
  }
};

module.exports = { initSocket, emitQueueUpdate, emitCurrentToken, emitPatientAdded };
