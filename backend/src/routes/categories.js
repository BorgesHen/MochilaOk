const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { ensureDestinationAccess } = require("../lib/access");

const router = express.Router();

const ALLOWED_MODES = new Set(["PER_USER", "CLAIMABLE"]);

router.get("/destinations/:destinationId/categories", requireAuth, async (req, res) => {
  try {
    await ensureDestinationAccess(req.user.sub, req.params.destinationId);

    const q = await pool.query(
      `
      SELECT id, destination_id, name, mode, sort_order
      FROM categories
      WHERE destination_id = $1
      ORDER BY sort_order ASC, name ASC
      `,
      [req.params.destinationId]
    );

    return res.json(q.rows);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.post("/destinations/:destinationId/categories", requireAuth, async (req, res) => {
  try {
    await ensureDestinationAccess(req.user.sub, req.params.destinationId);

    const { name, mode, sort_order } = req.body;

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: "name é obrigatório (mín. 2 caracteres)" });
    }
    if (!ALLOWED_MODES.has(mode)) {
      return res.status(400).json({ error: "mode deve ser PER_USER ou CLAIMABLE" });
    }

    const ins = await pool.query(
      `
      INSERT INTO categories (destination_id, name, mode, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [req.params.destinationId, String(name).trim(), mode, Number.isInteger(sort_order) ? sort_order : 0]
    );

    return res.status(201).json(ins.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Já existe uma categoria com esse nome nessa viagem" });
    }
    return res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
