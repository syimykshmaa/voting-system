const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authRequired } = require("../middleware/auth");
const { serializeUser } = require("../utils/serializers");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

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
      role: "USER",
      passwordHash,
    });

    const token = jwt.sign(
      { id: String(user._id), username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: String(user._id), username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token, user: serializeUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(serializeUser(user));
  } catch (err) {
    return next(err);
  }
});

router.post("/logout", authRequired, (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
