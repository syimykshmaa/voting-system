const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Vote = require("../models/Vote");
const { authRequired, roleRequired } = require("../middleware/auth");
const { serializeUser } = require("../utils/serializers");

const router = express.Router();

router.use(authRequired, roleRequired("ADMIN"));

router.get("/", async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(serializeUser));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "name, username, email and password are required" });
    }

    const exists = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
    if (exists) {
      return res.status(400).json({ message: "User with this username or email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username,
      email: email.toLowerCase(),
      role: role || "USER",
      passwordHash,
    });

    res.status(201).json(serializeUser(user));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { name, username, email, role, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const taken = await User.findOne({ username });
      if (taken) return res.status(400).json({ message: "Username already in use" });
      user.username = username;
    }

    if (email && email.toLowerCase() !== user.email) {
      const taken = await User.findOne({ email: email.toLowerCase() });
      if (taken) return res.status(400).json({ message: "Email already in use" });
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (password) user.passwordHash = await bcrypt.hash(password, 10);

    await user.save();
    res.json(serializeUser(user));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const deleted = await User.findByIdAndDelete(targetId);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    await Vote.deleteMany({ userId: targetId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
