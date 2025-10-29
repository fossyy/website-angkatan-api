import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

const now = "\x1b[35m" + new Date().toISOString() + "\x1b[0m";

try {
  const client = await pool.connect();
  client.release();
  console.log("----------------");
  console.log("db connection OK at", now);
  console.log("----------------");
} catch (e) {
  console.error("--------------------");
  console.error("db connection FAILED at", now);
  console.error("--------------------");
  throw e;
}
