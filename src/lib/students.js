import { pool } from "./db.js";

// TODO: CHANGE tableName
const tableName = "table_name";

export async function sanityCheck() {
  try {
    const res = await pool.query("SELECT $1::text as message", ["YOU'RE SANE!!!"]);
    return res.rows;
  } catch (e) {
    console.error("YOU'RE INSANE!!!")
    throw e;
  }
}

export async function getStudents() {
  try {
    const res = await pool.query(`SELECT * FROM ${tableName}`);
    return res.rows;
  } catch (e) {
    console.error("Failed getting students");
    throw e;
  }
}

export async function getStudentById(id) {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId))
    throw new Error("Invalid id");

  try {
    const res = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [parsedId]);
    return res.rows;
  } catch (e) {
    console.error(`Failed getting student by id: ${parsedId}`);
    throw e;
  }
}