const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    party: { type: String, default: "", trim: true },
    bio: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "COMPLETED"],
      default: "DRAFT",
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidates: { type: [candidateSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Election", electionSchema);
