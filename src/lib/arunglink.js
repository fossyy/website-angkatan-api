import { pool } from "./db.js";

function slugify(text) {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function insertArunglink(title, category, link, slugInput = "auto") {
  let slug = slugInput === "auto" ? slugify(title) : slugify(slugInput);
  let baseSlug = slug;
  let counter = 1;

  while (true) {
    const exists = await pool.query(`SELECT slug FROM arunglink WHERE slug = $1`, [slug]);
    if (exists.rows.length === 0) break;
    slug = `${baseSlug}-${counter++}`;
  }

  const query = `
    INSERT INTO arunglink (slug, title, category, link)
    VALUES ($1, $2, $3, $4)
    RETURNING slug;
  `;
  const values = [slug, title, category, link];
  const result = await pool.query(query, values);
  return result.rows[0].slug;
}

export async function removeArungLinkBySlug(slug) {
  await pool.query(`DELETE FROM arunglink WHERE slug = $1;`, [slug]);
}

export async function getAllLinks() {
  const query = `
    SELECT slug, title, category, link, uploaded_at
    FROM arunglink
    ORDER BY uploaded_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

export async function getLinkBySlug(slug) {
  const query = `
    SELECT slug, title, category, link, uploaded_at
    FROM arunglink
    WHERE slug = $1;
  `;
  const result = await pool.query(query, [slug]);
  return result.rows[0];
}

export async function getLinksByCategory(category) {
  const query = `
    SELECT slug, title, category, link, uploaded_at
    FROM arunglink
    WHERE category = $1
    ORDER BY uploaded_at DESC;
  `;
  const result = await pool.query(query, [category]);
  return result.rows;
}
