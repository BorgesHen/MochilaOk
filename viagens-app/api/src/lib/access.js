const { pool } = require("../db");

function normalizeRole(role) {
  const value = String(role || "").toUpperCase();

  if (value === "OWNER" || value === "ADMIN") {
    return "ADMIN";
  }

  return "MEMBER";
}

function isAdminRole(role) {
  return normalizeRole(role) === "ADMIN";
}

function withNormalizedRole(row) {
  if (!row) return row;

  const myRole = normalizeRole(row.my_role || row.role);

  return {
    ...row,
    my_role: myRole,
    is_admin: myRole === "ADMIN",
  };
}

async function ensureDestinationAccess(userId, destinationId) {
  const q = await pool.query(
    `
    SELECT d.*,
           dm.user_id AS member_user_id,
           CASE
             WHEN d.owner_id = $1 THEN 'ADMIN'
             ELSE dm.role
           END AS my_role
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
    const err = new Error("Viagem não encontrada ou sem acesso");
    err.status = 404;
    throw err;
  }

  const row = q.rows[0];

  // Correção automática: se a pessoa é criadora/owner da viagem, ela sempre deve ser ADMIN,
  // mesmo que a linha em destination_members ainda não tenha sido criada por uma versão antiga do sistema.
  if (String(row.owner_id) === String(userId)) {
    await pool.query(
      `
      INSERT INTO destination_members (destination_id, user_id, role)
      VALUES ($1, $2, 'ADMIN')
      ON CONFLICT (destination_id, user_id)
      DO UPDATE SET role = 'ADMIN'
      `,
      [destinationId, userId]
    );

    row.my_role = 'ADMIN';
  }

  delete row.member_user_id;
  return withNormalizedRole(row);
}

async function ensureDestinationAdmin(userId, destinationId) {
  const destination = await ensureDestinationAccess(userId, destinationId);

  if (!isAdminRole(destination.my_role)) {
    const err = new Error("Apenas o administrador da viagem pode fazer essa ação");
    err.status = 403;
    throw err;
  }

  return destination;
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

async function ensureItemAdmin(userId, itemId) {
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
  await ensureDestinationAdmin(userId, item.destination_id);
  return item;
}

module.exports = {
  normalizeRole,
  isAdminRole,
  withNormalizedRole,
  ensureDestinationAccess,
  ensureDestinationAdmin,
  ensureItemAccess,
  ensureItemAdmin,
};
