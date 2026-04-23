const express = require("express");
const Vote = require("../models/Vote");
const Election = require("../models/Election");
const { authRequired, roleRequired } = require("../middleware/auth");
const { serializeVote, serializeElection } = require("../utils/serializers");

const router = express.Router();

router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const votes = await Vote.find().sort({ timestamp: -1 });
    res.json(votes.map(serializeVote));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { userId, electionId, candidateId } = req.body;

    if (!userId || !electionId || !candidateId) {
      return res.status(400).json({ message: "userId, electionId and candidateId are required" });
    }

    if (String(req.user.id) !== String(userId) && !["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (election.status !== "ACTIVE") {
      return res.status(400).json({ message: "Election is not active" });
    }

    const candidateExists = election.candidates.some((c) => c.id === String(candidateId));
    if (!candidateExists) {
      return res.status(400).json({ message: "Candidate not found" });
    }

    const existing = await Vote.findOne({ userId, electionId });
    if (existing) {
      return res.status(400).json({ message: "You have already voted in this election" });
    }

    const vote = await Vote.create({ userId, electionId, candidateId });
    res.status(201).json(serializeVote(vote));
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({ message: "You have already voted in this election" });
    }
    next(err);
  }
});

router.get("/check/:electionId", async (req, res, next) => {
  try {
    const voted = await Vote.exists({ userId: req.user.id, electionId: req.params.electionId });
    res.json({ voted: Boolean(voted) });
  } catch (err) {
    next(err);
  }
});

router.get("/election/:id", roleRequired("ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const votes = await Vote.find({ electionId: req.params.id }).sort({ timestamp: -1 });
    res.json(votes.map(serializeVote));
  } catch (err) {
    next(err);
  }
});

router.get("/results/:electionId", async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const votes = await Vote.find({ electionId: req.params.electionId });
    const results = election.candidates.map((c) => ({
      ...c.toObject(),
      voteCount: votes.filter((v) => v.candidateId === c.id).length,
    }));

    res.json({
      election: serializeElection(election),
      results,
      totalVotes: votes.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
