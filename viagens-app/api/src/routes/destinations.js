const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { ensureDestinationAccess } = require("../lib/access");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.sub;

  const q = await pool.query(
    `
    SELECT d.*,
           CASE WHEN d.owner_id = $1 THEN 'owner' ELSE dm.role END AS my_role
    FROM destinations d
    LEFT JOIN destination_members dm
      ON dm.destination_id = d.id AND dm.user_id = $1
    WHERE d.owner_id = $1 OR dm.user_id = $1
    ORDER BY d.created_at DESC
    `,
    [userId]
  );

  res.json(q.rows);
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.user.sub;
  const { title, location } = req.body;

  if (!title || String(title).trim().length < 2) {
    return res.status(400).json({ error: "title é obrigatório (mín 2)" });
  }

  const ins = await pool.query(
    `
    INSERT INTO destinations (title, location, owner_id)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [String(title).trim(), location || null, userId]
  );

  const destination = ins.rows[0];

  await pool.query(
    `
    INSERT INTO destination_members (destination_id, user_id, role)
    VALUES ($1, $2, 'owner')
    ON CONFLICT DO NOTHING
    `,
    [destination.id, userId]
  );

  res.status(201).json(destination);
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const destination = await ensureDestinationAccess(req.user.sub, req.params.id);

    const members = await pool.query(
      `
      SELECT dm.user_id, dm.role, dm.joined_at, u.name, u.email
      FROM destination_members dm
      JOIN users u ON u.id = dm.user_id
      WHERE dm.destination_id = $1
      ORDER BY dm.joined_at ASC
      `,
      [req.params.id]
    );

    res.json({ destination, members: members.rows });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
