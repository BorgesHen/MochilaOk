const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/requireAuth");
const { ensureDestinationAccess } = require("../lib/access");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const q = await pool.query(
      `
      SELECT d.*,
             CASE WHEN d.owner_id = $1 THEN 'owner' ELSE dm.role END AS my_role,
             tt.name AS trip_type_name,
             tt.slug AS trip_type_slug
      FROM destinations d
      LEFT JOIN destination_members dm
        ON dm.destination_id = d.id AND dm.user_id = $1
      LEFT JOIN trip_types tt
        ON tt.id = d.trip_type_id
      WHERE d.owner_id = $1 OR dm.user_id = $1
      ORDER BY d.created_at DESC
      `,
      [userId]
    );

    return res.json(q.rows);
  } catch (err) {
    const msg = String(err.message);
    if (msg.includes("trip_types") || msg.includes("trip_type_id") || msg.includes("status")) {
      const q2 = await pool.query(
        `
        SELECT d.*,
               CASE WHEN d.owner_id = $1 THEN 'owner' ELSE dm.role END AS my_role
        FROM destinations d
        LEFT JOIN destination_members dm
          ON dm.destination_id = d.id AND dm.user_id = $1
        WHERE d.owner_id = $1 OR dm.user_id = $1
        ORDER BY d.created_at DESC
        `,
        [req.user.sub]
      );
      return res.json(q2.rows);
    }

    return res.status(500).json({ error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { title, location, trip_type_id, start_date, end_date, status } = req.body;

    if (!title || String(title).trim().length < 2) {
      return res.status(400).json({ error: "title é obrigatório (mín. 2 caracteres)" });
    }

    try {
      const ins = await pool.query(
        `
        INSERT INTO destinations (title, location, owner_id, trip_type_id, start_date, end_date, status)
        VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'PLANNED'))
        RETURNING *
        `,
        [title, location || null, userId, trip_type_id || null, start_date || null, end_date || null, status || null]
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

      return res.status(201).json(destination);
    } catch (e) {
      const msg = String(e.message);
      if (msg.includes("trip_type_id") || msg.includes("status") || msg.includes("start_date")) {
        const ins2 = await pool.query(
          `
          INSERT INTO destinations (title, location, owner_id)
          VALUES ($1, $2, $3)
          RETURNING *
          `,
          [title, location || null, userId]
        );

        const destination = ins2.rows[0];

        await pool.query(
          `
          INSERT INTO destination_members (destination_id, user_id, role)
          VALUES ($1, $2, 'owner')
          ON CONFLICT DO NOTHING
          `,
          [destination.id, userId]
        );

        return res.status(201).json(destination);
      }
      throw e;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
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

    return res.json({ destination, members: members.rows });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
