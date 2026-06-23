const express = require("express");
const router = express.Router();
const { callNext, getCurrentState, updateAvgTime } = require("../controllers/queueController");

// POST  /api/queue/call-next   — mark next waiting patient as in-progress
// GET   /api/queue/current     — get current in-progress patient + full state
// PATCH /api/queue/avg-time    — update average consultation time
router.post("/call-next", callNext);
router.get("/current", getCurrentState);
router.patch("/avg-time", updateAvgTime);

module.exports = router;
