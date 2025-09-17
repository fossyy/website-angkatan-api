import { pool } from "./db.js";

// TODO: CHANGE tableName
const tableName = "mahasiswa";

export async function sanityCheck() {
  try {
    const res = await pool.query("SELECT $1::text as message", ["YOU'RE SANE!!!"]);
    return res.rows;
  } catch (e) {
    console.error("YOU'RE INSANE!!!")
    throw e;
  }
}

export async function getStudents(items, page) {
  const parsedItems = parseInt(items)
  const parsedPage = parseInt(page)

  if (!Number.isInteger(parsedItems))
    throw new Error("items not an integer")
  if (!Number.isInteger(parsedPage))
    throw new Error("page not an integer")

  const offsetPage = (page - 1) * items
  try {
    const res = await pool.query(`SELECT * FROM ${tableName} LIMIT $1 OFFSET $2`, [parsedItems, offsetPage]);
    return res.rows;
  } catch (e) {
    console.error("Failed getting students");
    throw e;
  }
}

export async function getStudentById(id) {
  const parsedId = parseInt(id);

  if (!Number.isInteger(parsedId))
    throw new Error("id not an integer");

  try {
    const res = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [parsedId]);
    return res.rows;
  } catch (e) {
    console.error(`Failed getting student by id: ${parsedId}`);
    throw e;
  }
}