import { pool } from "./db.js";

export async function insertArunglink(data) {
  const { title, category, link } = data;
  
  const query = `
    INSERT INTO arunglink (title, category, link) 
    VALUES ($1, $2, $3) 
    RETURNING id;
  `;
  const values = [title, category, link];
  const result = await pool.query(query, values);

  return result.rows[0].id;
}

export async function getAllLinks() {
  const query = `
    SELECT id, title, category, link, uploaded_at
    FROM arunglink
    ORDER BY uploaded_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

export async function getLinkById(id) {
  const query = `
    SELECT id, title, category, link, uploaded_at
    FROM arunglink
    WHERE id = $1;
  `;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getLinksByCategory(category) {
  const query = `
    SELECT id, title, category, link, uploaded_at
    FROM arunglink
    WHERE category = $1
    ORDER BY uploaded_at DESC;
  `;
  const values = [category];
  const result = await pool.query(query, values);
  return result.rows;
}