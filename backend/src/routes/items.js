const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { ensureDestinationAccess, ensureItemAccess } = require("../lib/access");

const router = express.Router();
const ALLOWED_STATUS = new Set(["PENDING", "DONE"]);

router.get("/destinations/:destinationId/items", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const destinationId = req.params.destinationId;

    await ensureDestinationAccess(userId, destinationId);

    const q = await pool.query(
      `
      SELECT
        i.id, i.destination_id, i.category_id, i.title, i.qty, i.unit, i.notes, i.created_by, i.created_at,
        c.name AS category_name,
        c.mode AS category_mode,
        COALESCE(iu.status, 'PENDING') AS my_status,
        COALESCE(iu.claimed, false) AS my_claimed,
        cl.user_id AS claimed_by
      FROM items i
      JOIN categories c ON c.id = i.category_id
      LEFT JOIN item_user iu
        ON iu.item_id = i.id AND iu.user_id = $2
      LEFT JOIN LATERAL (
        SELECT user_id
        FROM item_user
        WHERE item_id = i.id AND claimed = true
        LIMIT 1
      ) cl ON true
      WHERE i.destination_id = $1
      ORDER BY c.sort_order ASC, c.name ASC, i.created_at DESC
      `,
      [destinationId, userId]
    );

    return res.json(q.rows);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.post("/destinations/:destinationId/items", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const destinationId = req.params.destinationId;
    const { category_id, title, qty, unit, notes } = req.body;

    await ensureDestinationAccess(userId, destinationId);

    if (!category_id) return res.status(400).json({ error: "category_id é obrigatório" });
    if (!title || String(title).trim().length < 2) {
      return res.status(400).json({ error: "title é obrigatório (mín. 2 caracteres)" });
    }

    const cat = await pool.query(
      `SELECT id, mode FROM categories WHERE id = $1 AND destination_id = $2`,
      [category_id, destinationId]
    );
    if (cat.rows.length === 0) {
      return res.status(400).json({ error: "Categoria inválida para esta viagem" });
    }

    const ins = await pool.query(
      `
      INSERT INTO items (destination_id, category_id, title, qty, unit, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        destinationId,
        category_id,
        String(title).trim(),
        qty == null ? null : Number(qty),
        unit || null,
        notes || null,
        userId,
      ]
    );

    return res.status(201).json(ins.rows[0]);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.patch("/items/:itemId/claim", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const itemId = req.params.itemId;
    const claimed = !!req.body.claimed;

    const item = await ensureItemAccess(userId, itemId);

    const qMode = await pool.query(
      `
      SELECT c.mode
      FROM items i
      JOIN categories c ON c.id = i.category_id
      WHERE i.id = $1
      `,
      [itemId]
    );

    const mode = qMode.rows[0]?.mode;
    if (mode !== "CLAIMABLE") {
      return res.status(400).json({ error: "Este item não é claimable (categoria não é CLAIMABLE)" });
    }

    if (claimed) {
      try {
        await pool.query(
          `
          INSERT INTO item_user (item_id, user_id, claimed, status)
          VALUES ($1, $2, true, 'PENDING')
          ON CONFLICT (item_id, user_id)
          DO UPDATE SET claimed = true, updated_at = now()
          `,
          [itemId, userId]
        );

        return res.json({ ok: true, claimed: true });
      } catch (err) {
        if (err.code === "23505") {
          return res.status(409).json({ error: "Este item já foi claimado por outra pessoa" });
        }
        throw err;
      }
    } else {
      await pool.query(
        `
        UPDATE item_user
        SET claimed = false, updated_at = now()
        WHERE item_id = $1 AND user_id = $2
        `,
        [itemId, userId]
      );
      return res.json({ ok: true, claimed: false });
    }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.patch("/items/:itemId/status", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const itemId = req.params.itemId;
    const { status } = req.body;

    if (!ALLOWED_STATUS.has(status)) {
      return res.status(400).json({ error: "status deve ser PENDING ou DONE" });
    }

    await ensureItemAccess(userId, itemId);

    const q = await pool.query(
      `
      SELECT c.mode
      FROM items i
      JOIN categories c ON c.id = i.category_id
      WHERE i.id = $1
      `,
      [itemId]
    );

    const mode = q.rows[0]?.mode;

    if (mode === "CLAIMABLE") {
      const mine = await pool.query(
        `SELECT claimed FROM item_user WHERE item_id = $1 AND user_id = $2`,
        [itemId, userId]
      );

      if (mine.rows.length === 0 || mine.rows[0].claimed !== true) {
        return res.status(403).json({ error: "Você precisa claimar este item antes de mudar o status" });
      }
    }

    await pool.query(
      `
      INSERT INTO item_user (item_id, user_id, claimed, status)
      VALUES ($1, $2, false, $3)
      ON CONFLICT (item_id, user_id)
      DO UPDATE SET status = $3, updated_at = now()
      `,
      [itemId, userId, status]
    );

    return res.json({ ok: true, status });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;