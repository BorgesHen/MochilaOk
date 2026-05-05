const { Pool } = require("pg");
require("dotenv").config();

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


const isLocal =
<<<<<<< HEAD
  raw.includes("localhost")
raw.includes("127.0.0.1");
=======
  raw.includes("localhost") ||
  raw.includes("127.0.0.1");
>>>>>>> 8eb8dff759c237c18d89552c2b88a020fed0303e

const pool = new Pool({
  connectionString: stripSslParams(raw),
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

module.exports = { pool };
