import { pool } from "./db.js";

export async function insertImage(title, link) {
  const query = `
    INSERT INTO gallery (title, link)
    VALUES ($1, $2)
    RETURNING id;
  `;
  const values = [title, link];
  const result = await pool.query(query, values);
  return result.rows[0].id;
}

export async function getAllImages() {
  const query = `
    SELECT id, title, link, uploaded_at
    FROM gallery
    ORDER BY id ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
}