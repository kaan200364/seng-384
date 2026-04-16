const express = require("express");
const router = express.Router();
const pool = require("../db");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/people
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM people ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET /api/people/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM people WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "PERSON_NOT_FOUND" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// POST /api/people
router.post("/", async (req, res) => {
  try {
    const { full_name, email } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "INVALID_EMAIL_FORMAT" });
    }

    const existing = await pool.query("SELECT * FROM people WHERE email = $1", [email]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }

    const result = await pool.query(
      "INSERT INTO people (full_name, email) VALUES ($1, $2) RETURNING *",
      [full_name, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PUT /api/people/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "INVALID_EMAIL_FORMAT" });
    }

    const personCheck = await pool.query("SELECT * FROM people WHERE id = $1", [id]);

    if (personCheck.rows.length === 0) {
      return res.status(404).json({ error: "PERSON_NOT_FOUND" });
    }

    const emailCheck = await pool.query(
      "SELECT * FROM people WHERE email = $1 AND id != $2",
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }

    const result = await pool.query(
      "UPDATE people SET full_name = $1, email = $2 WHERE id = $3 RETURNING *",
      [full_name, email, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// DELETE /api/people/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM people WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "PERSON_NOT_FOUND" });
    }

    res.status(200).json({ message: "PERSON_DELETED" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

module.exports = router;