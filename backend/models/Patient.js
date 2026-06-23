const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    tokenNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["waiting", "in-progress", "completed"],
      default: "waiting",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Index for fast queue queries
patientSchema.index({ status: 1, tokenNumber: 1 });

/**
 * Static method: generate next sequential token number
 */
patientSchema.statics.generateToken = async function () {
  const last = await this.findOne({}, { tokenNumber: 1 }, { sort: { tokenNumber: -1 } });
  return last ? last.tokenNumber + 1 : 1;
};

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
