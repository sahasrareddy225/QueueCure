const Patient = require("../models/Patient");
const { emitQueueUpdate, emitCurrentToken } = require("../sockets/socketHandler");

// In-memory average consultation time (minutes) — persists across requests
let avgConsultationTime = 10;

/**
 * POST /api/queue/call-next
 * Mark the first waiting patient as in-progress
 */
const callNext = async (req, res) => {
  try {
    // Complete any currently in-progress patient first
    await Patient.updateMany({ status: "in-progress" }, { $set: { status: "completed" } });

    // Find next waiting patient
    const nextPatient = await Patient.findOne({ status: "waiting" }).sort({ tokenNumber: 1 });

    if (!nextPatient) {
      // No more patients — emit empty state
      const queue = await Patient.find({ status: "waiting" }).sort({ tokenNumber: 1 });
      emitQueueUpdate({ queue, avgTime: avgConsultationTime });
      emitCurrentToken({ currentPatient: null, queue, avgTime: avgConsultationTime });
      return res.json({ success: true, currentPatient: null, message: "Queue is empty" });
    }

    nextPatient.status = "in-progress";
    await nextPatient.save();

    const queue = await Patient.find({ status: "waiting" }).sort({ tokenNumber: 1 });

    emitCurrentToken({ currentPatient: nextPatient, queue, avgTime: avgConsultationTime });
    emitQueueUpdate({ queue, avgTime: avgConsultationTime });

    res.json({ success: true, currentPatient: nextPatient });
  } catch (error) {
    console.error("callNext error:", error);
    res.status(500).json({ success: false, message: "Failed to call next patient" });
  }
};

/**
 * GET /api/queue/current
 * Get currently in-progress patient + full waiting queue + avgTime
 */
const getCurrentState = async (req, res) => {
  try {
    const currentPatient = await Patient.findOne({ status: "in-progress" });
    const queue = await Patient.find({ status: "waiting" }).sort({ tokenNumber: 1 });
    const allPatients = await Patient.find().sort({ tokenNumber: 1 });

    res.json({
      success: true,
      currentPatient,
      queue,
      allPatients,
      avgTime: avgConsultationTime,
    });
  } catch (error) {
    console.error("getCurrentState error:", error);
    res.status(500).json({ success: false, message: "Failed to get queue state" });
  }
};

/**
 * PATCH /api/queue/avg-time
 * Update average consultation time
 * Body: { avgTime: number } (minutes)
 */
const updateAvgTime = async (req, res) => {
  try {
    const { avgTime } = req.body;
    const parsed = parseInt(avgTime, 10);

    if (isNaN(parsed) || parsed < 1 || parsed > 120) {
      return res.status(400).json({ success: false, message: "avgTime must be between 1 and 120 minutes" });
    }

    avgConsultationTime = parsed;

    // Notify all clients of the avg time change
    const queue = await Patient.find({ status: "waiting" }).sort({ tokenNumber: 1 });
    const currentPatient = await Patient.findOne({ status: "in-progress" });
    emitQueueUpdate({ queue, avgTime: avgConsultationTime });
    emitCurrentToken({ currentPatient, queue, avgTime: avgConsultationTime });

    res.json({ success: true, avgTime: avgConsultationTime });
  } catch (error) {
    console.error("updateAvgTime error:", error);
    res.status(500).json({ success: false, message: "Failed to update avg time" });
  }
};

module.exports = { callNext, getCurrentState, updateAvgTime };
