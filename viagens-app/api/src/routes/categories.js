const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { ensureDestinationAccess } = require("../lib/access");

const router = express.Router();
const ALLOWED_MODES = new Set(["PER_USER", "CLAIMABLE"]);

router.get("/:destinationId/categories", requireAuth, async (req, res) => {
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

  res.json(q.rows);
});

router.post("/:destinationId/categories", requireAuth, async (req, res) => {
  await ensureDestinationAccess(req.user.sub, req.params.destinationId);

  const { name, mode, sort_order } = req.body;

  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: "name é obrigatório (mín 2)" });
  }
  if (!ALLOWED_MODES.has(mode)) {
    return res.status(400).json({ error: "mode deve ser PER_USER ou CLAIMABLE" });
  }

  try {
    const ins = await pool.query(
      `
      INSERT INTO categories (destination_id, name, mode, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [req.params.destinationId, String(name).trim(), mode, Number.isInteger(sort_order) ? sort_order : 0]
    );
    res.status(201).json(ins.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Categoria já existe nessa viagem" });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
