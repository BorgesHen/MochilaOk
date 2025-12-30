const { Pool } = require("pg");

function stripSslParams(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("sslcert");
    u.searchParams.delete("sslkey");
    u.searchParams.delete("sslrootcert");
    return u.toString();
  } catch {
    return url;
  }
}

const raw = process.env.DATABASE_URL;
if (!raw) throw new Error("DATABASE_URL não definida no .env");

const pool = new Pool({
  connectionString: stripSslParams(raw),
  ssl: { rejectUnauthorized: false }
});

module.exports = { pool };
