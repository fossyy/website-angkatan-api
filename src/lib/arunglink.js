import { pool } from "./db.js";

const MOCK_MODE = true;
const TEST_DATA = [
  {
    slug: 'scele-ui',
    title: 'SCELE UI',
    category: 'academic',
    link: 'https://scele.ui.ac.id',
    status: 'on',
    uploaded_at: '2025-01-20T08:00:00.000Z'
  },
  {
    slug: 'github-repo',
    title: 'Github Repository',
    category: 'administration',
    link: 'https://github.com',
    status: 'on',
    uploaded_at: '2025-09-20T08:00:00.000Z'
  },
  {
    slug: 'discord-link',
    title: 'Discord Link',
    category: 'event',
    link: 'https://discord.com/',
    status: 'none',
    uploaded_at: '2024-01-20T08:00:00.000Z'
  }
];

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

// Insert new link
export async function insertArunglink(title, category, link, status = 'none', slugInput = "auto") {
  let slug = slugInput === "auto" ? slugify(title) : slugify(slugInput);
  let baseSlug = slug;
  let counter = 1;

  while (true) {
    const exists = await pool.query(`SELECT slug FROM arunglink WHERE slug = $1`, [slug]);
    if (exists.rows.length === 0) break;
    slug = `${baseSlug}-${counter++}`;
  }

  const query = `
    INSERT INTO arunglink (slug, title, category, link, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING slug;
  `;
  const values = [slug, title, category, link, status];
  const result = await pool.query(query, values);
  return result.rows[0].slug;
}

// Remove link by slug
export async function removeArungLinkBySlug(slug) {
  await pool.query(`DELETE FROM arunglink WHERE slug = $1;`, [slug]);
}

// Get all links
export async function getAllLinks() {
  if (MOCK_MODE) return TEST_DATA; // Uncomment untuk testing
  
  const query = `
    SELECT slug, title, category, link, status, uploaded_at
    FROM arunglink
    ORDER BY uploaded_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

// Get link by slug
export async function getLinkBySlug(slug) {
  const query = `
    SELECT slug, title, category, link, status, uploaded_at
    FROM arunglink
    WHERE slug = $1;
  `;
  const result = await pool.query(query, [slug]);
  return result.rows[0];
}

// Filter links
export async function getFilteredLinks(filters = {}) {
  const { category, from, to, search } = filters;
  
  const conditions = [];
  const values = [];
  let paramCounter = 1;

  if (category) {
    conditions.push(`category = $${paramCounter}`);
    values.push(category);
    paramCounter++;
  }

  if (from) {
    conditions.push(`uploaded_at >= $${paramCounter}`);
    values.push(from);
    paramCounter++;
  }

  if (to) {
    conditions.push(`uploaded_at <= $${paramCounter}`);
    values.push(to);
    paramCounter++;
  }

  if (search) {
    conditions.push(`title ILIKE $${paramCounter}`);
    values.push(`%${search}%`); // ILIKE untuk case-insensitive search
    paramCounter++;
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : ''; // Jika tidak ada filter, tampilkan semua

  const query = `
    SELECT slug, title, category, link, status, uploaded_at
    FROM arunglink
    ${whereClause}
    ORDER BY uploaded_at DESC;
  `;

  const result = await pool.query(query, values);
  return result.rows;
}

