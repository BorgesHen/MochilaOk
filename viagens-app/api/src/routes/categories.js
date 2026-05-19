const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { ensureDestinationAccess, ensureDestinationAdmin } = require("../lib/access");

const router = express.Router();
const ALLOWED_MODES = new Set(["PER_USER", "CLAIMABLE"]);

function normalizeSortOrder(value) {
  const n = Number(value);
  return Number.isInteger(n) ? n : 0;
}

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
  await ensureDestinationAdmin(req.user.sub, req.params.destinationId);

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
      [req.params.destinationId, String(name).trim(), mode, normalizeSortOrder(sort_order)]
    );
    res.status(201).json(ins.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Categoria já existe nessa viagem" });
    }
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:destinationId/categories/:categoryId", requireAuth, async (req, res) => {
  await ensureDestinationAdmin(req.user.sub, req.params.destinationId);

  const { name, mode, sort_order } = req.body;

  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: "name é obrigatório (mín 2)" });
  }
  if (!ALLOWED_MODES.has(mode)) {
    return res.status(400).json({ error: "mode deve ser PER_USER ou CLAIMABLE" });
  }

  try {
    const q = await pool.query(
      `
      UPDATE categories
      SET name = $1, mode = $2, sort_order = $3
      WHERE id = $4 AND destination_id = $5
      RETURNING *
      `,
      [String(name).trim(), mode, normalizeSortOrder(sort_order), req.params.categoryId, req.params.destinationId]
    );

    if (q.rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json(q.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Categoria já existe nessa viagem" });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:destinationId/categories/:categoryId", requireAuth, async (req, res) => {
  await ensureDestinationAdmin(req.user.sub, req.params.destinationId);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const items = await client.query(
      `SELECT id FROM items WHERE category_id = $1 AND destination_id = $2`,
      [req.params.categoryId, req.params.destinationId]
    );

    for (const item of items.rows) {
      await client.query(`DELETE FROM item_user WHERE item_id = $1`, [item.id]);
    }

    await client.query(
      `DELETE FROM items WHERE category_id = $1 AND destination_id = $2`,
      [req.params.categoryId, req.params.destinationId]
    );

    const del = await client.query(
      `DELETE FROM categories WHERE id = $1 AND destination_id = $2 RETURNING id`,
      [req.params.categoryId, req.params.destinationId]
    );

    await client.query("COMMIT");

    if (del.rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
