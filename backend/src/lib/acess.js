const { pool } = require("../db");

async function ensureDestinationAccess(userId, destinationId) {
  const q = await pool.query(
    `
    SELECT d.*,
           CASE WHEN d.owner_id = $1 THEN 'owner' ELSE dm.role END AS my_role
    FROM destinations d
    LEFT JOIN destination_members dm
      ON dm.destination_id = d.id AND dm.user_id = $1
    WHERE d.id = $2
      AND (d.owner_id = $1 OR dm.user_id IS NOT NULL)
    LIMIT 1
    `,
    [userId, destinationId]
  );

  if (q.rows.length === 0) {
    const err = new Error("Viagem/destino não encontrado ou sem acesso");
    err.status = 404;
    throw err;
  }

  return q.rows[0];
}

async function ensureItemAccess(userId, itemId) {
  const q = await pool.query(
    `SELECT id, destination_id, category_id FROM items WHERE id = $1`,
    [itemId]
  );

  if (q.rows.length === 0) {
    const err = new Error("Item não encontrado");
    err.status = 404;
    throw err;
  }

  const item = q.rows[0];
  await ensureDestinationAccess(userId, item.destination_id);
  return item;
}

module.exports = { ensureDestinationAccess, ensureItemAccess };
