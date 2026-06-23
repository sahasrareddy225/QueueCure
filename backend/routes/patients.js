const express = require("express");
const router = express.Router();
const { getPatients, createPatient } = require("../controllers/patientController");

// GET  /api/patients      — list all patients
// POST /api/patients      — add a new patient
router.get("/", getPatients);
router.post("/", createPatient);

module.exports = router;
