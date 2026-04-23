const express = require("express");
const Election = require("../models/Election");
const Vote = require("../models/Vote");
const { authRequired, roleRequired } = require("../middleware/auth");
const { serializeElection } = require("../utils/serializers");

const router = express.Router();

router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections.map(serializeElection));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.json(serializeElection(election));
  } catch (err) {
    next(err);
  }
});

router.post("/", roleRequired("ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, candidates } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: "title, startDate and endDate are required" });
    }

    const normalizedCandidates = (Array.isArray(candidates) ? candidates : []).map((c) => ({
      id: String(c.id || `${Date.now()}-${Math.random()}`),
      name: c.name || "",
      party: c.party || "",
      bio: c.bio || "",
    }));

    const election = await Election.create({
      title,
      description: description || "",
      startDate,
      endDate,
      status: "DRAFT",
      createdBy: req.user.id,
      candidates: normalizedCandidates,
    });

    res.status(201).json(serializeElection(election));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", roleRequired("ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, candidates, status } = req.body;
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (title !== undefined) election.title = title;
    if (description !== undefined) election.description = description;
    if (startDate !== undefined) election.startDate = startDate;
    if (endDate !== undefined) election.endDate = endDate;
    if (status !== undefined) election.status = status;

    if (Array.isArray(candidates)) {
      election.candidates = candidates.map((c) => ({
        id: String(c.id || `${Date.now()}-${Math.random()}`),
        name: c.name || "",
        party: c.party || "",
        bio: c.bio || "",
      }));
    }

    await election.save();
    res.json(serializeElection(election));
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", roleRequired("ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["DRAFT", "ACTIVE", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.json(serializeElection(election));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", roleRequired("ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const deleted = await Election.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Election not found" });
    }
    await Vote.deleteMany({ electionId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
