import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.PGURL,
})

const now = "\x1b[35m" + new Date().toISOString() + "\x1b[0m";

try {
  const client = await pool.connect();
  client.release();
  console.log("----------------")
  console.log("db connection OK at", now);
  console.log("----------------")
} catch (e) {
  console.error("--------------------")
  console.error("db connection FAILED at", now);
  console.error("--------------------")
  throw e;
}