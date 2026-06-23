const Patient = require("../models/Patient");
const { emitPatientAdded, emitQueueUpdate } = require("../sockets/socketHandler");

/**
 * GET /api/patients
 * Returns all patients sorted by tokenNumber
 */
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ tokenNumber: 1 });
    res.json({ success: true, patients });
  } catch (error) {
    console.error("getPatients error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch patients" });
  }
};

/**
 * POST /api/patients
 * Create a new patient with auto-generated token number
 * Body: { name: string }
 */
const createPatient = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Valid patient name is required (min 2 chars)" });
    }

    const tokenNumber = await Patient.generateToken();
    const patient = await Patient.create({ name: name.trim(), tokenNumber });

    // Emit socket events to all connected clients
    emitPatientAdded(patient);

    const allWaiting = await Patient.find({ status: "waiting" }).sort({ tokenNumber: 1 });
    emitQueueUpdate({ queue: allWaiting });

    res.status(201).json({ success: true, patient });
  } catch (error) {
    console.error("createPatient error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Token conflict — please retry" });
    }
    res.status(500).json({ success: false, message: "Failed to create patient" });
  }
};

module.exports = { getPatients, createPatient };
