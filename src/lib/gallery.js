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

export async function getImageByID(id) {
  try {
    const query = `SELECT * FROM gallery WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new Error(`Image with ID ${id} not found`);
    }
    return result.rows[0];
  } catch (err) {
    console.error('Error fetching image by ID:', err);
    throw err;
  }

}

export async function updateImageTitle(id, title) {
  const query = `
    UPDATE gallery
    SET title = ($1)
    WHERE id = ($2)
    RETURNING link;
  `;
  const result = await pool.query(query, [title, id]);
  return result.rows[0].link;
}

export async function updateImageLink(id, link) {
  const query = `
    UPDATE gallery
    SET link = ($1)
    WHERE id = ($2)
  `;
  const result = await pool.query(query, [link, id]);
  return result.rows;
}

export async function removeImageByID(id) {
  try {
    await pool.query('DELETE FROM gallery WHERE id = $1', [id]);
    console.log(`Removed image record ID ${id}`);

    return { success: true, message: `Image ${id} removed successfully.` };
  } catch (err) {
    console.error('Error removing image:', err);
    throw err;
  }
}