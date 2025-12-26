const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const q = await pool.query(
      "SELECT id, name, slug, created_at FROM trip_types ORDER BY name ASC"
    );
    return res.json(q.rows);
  } catch (err) {
    if (String(err.message).includes("relation") && String(err.message).includes("trip_types")) {
      return res.json([
        { id: null, name: "Passeio", slug: "passeio" },
        { id: null, name: "Trabalho", slug: "trabalho" },
        { id: null, name: "Trilha/Acampamento", slug: "trilha-acampamento" },
      ]);
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
