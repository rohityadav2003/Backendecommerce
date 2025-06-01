const express = require("express");
const router = express.Router();
const Footer = require("../models/footerMode");

// GET Footer
router.get("/", async (req, res) => {
  try {
    const footer = await Footer.findOne().sort({ createdAt: -1 });
    res.json(footer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Footer (Admin only)
router.post("/", async (req, res) => {
  try {
    const footer = new Footer(req.body);
    await footer.save();
    res.status(201).json(footer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
