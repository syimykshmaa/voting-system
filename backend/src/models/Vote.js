const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true, index: true },
    candidateId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

voteSchema.index({ userId: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
