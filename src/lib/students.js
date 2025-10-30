import { pool } from "./db.js";

// TODO: CHANGE tableName
const tableName = "mahasiswa";

export async function getStudents(items = 10, page) {
  const parsedItems = parseInt(items, 10);
  const parsedPage = parseInt(page, 10);

  if (!Number.isInteger(parsedItems) || parsedItems <= 0 || parsedItems > 20)
    throw new Error("items must be a positive integer less than 21");
  if (!Number.isInteger(parsedPage) || parsedPage <= 0)
    throw new Error("page must be a positive integer");

  const offsetPage = (parsedPage - 1) * parsedItems;

  try {
    const res = await pool.query(
      `SELECT *, COUNT(*) OVER() AS total_count FROM ${tableName} LIMIT $1 OFFSET $2`,
      [parsedItems, offsetPage]
    );
    const rows = res.rows;
    const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
    const totalPages = Math.ceil(total / parsedItems);

    const students = rows.map(({ total_count, ...student }) => student);

    return {
      students,
      meta: {
        total,
        totalPages,
        items: parsedItems,
        page: parsedPage,
      },
    };
  } catch (e) {
    console.error("Failed getting students");
    throw e;
  }
}

export async function getStudentById(id) {
  const parsedId = parseInt(id, 10);

  if (!Number.isInteger(parsedId) || parsedId <= 0)
    throw new Error("id must be a positive integer");

  try {
const query = `
      SELECT 
        m.id AS mahasiswa_id,
        m.nama,
        m.panggilan,
        m.jurusan,
        m.birthdate,
        m.sosmed,
        m.description,
        m.message,
        m.interests,
        m.avatar,
        msg.id AS comment_id,
        msg.content AS comment_content,
        msg.created_at AS comment_created_at
      FROM mahasiswa m
      LEFT JOIN message msg ON msg.mahasiswa_id = m.id
      WHERE m.id = $1
      ORDER BY msg.created_at DESC;
    `;

    const { rows } = await pool.query(query, [parsedId]);

    if (rows.length === 0) return null;

    const mahasiswa = {
      id: rows[0].mahasiswa_id,
      nama: rows[0].nama,
      panggilan: rows[0].panggilan,
      jurusan: rows[0].jurusan,
      birthdate: rows[0].birthdate,
      sosmed: rows[0].sosmed || {},
      description: rows[0].description,
      message: rows[0].message,
      interests: rows[0].interests || [],
      avatar: rows[0].avatar,
      comments: rows
        .filter(r => r.comment_id)
        .map(r => ({
          id: r.comment_id,
          content: r.comment_content,
          created_at: r.comment_created_at,
        })),
    };

    return mahasiswa;
  } catch (e) {
    console.error(`Failed getting student by id: ${parsedId}`);
    throw e;
  }
}

export async function getStudentByTags(jurusanTags, interestsTags, searchMode = "and", items = 10, page) {
  const parsedItems = parseInt(items, 10);
  const parsedPage = parseInt(page, 10);

  if (!Number.isInteger(parsedItems) || parsedItems <= 0 || parsedItems > 20)
    throw new Error("items must be a positive integer less than 21");
  if (!Number.isInteger(parsedPage) || parsedPage <= 0)
    throw new Error("page must be a positive integer");

  const offsetPage = (parsedPage - 1) * parsedItems;

  jurusanTags = Array.isArray(jurusanTags) ? jurusanTags : [jurusanTags];
  interestsTags = Array.isArray(interestsTags) ? interestsTags : [interestsTags];

  if (jurusanTags.length == 0 && interestsTags.length == 0)
    return { students: [], meta: { total: 0, totalPages: 0, items: parsedItems, page: parsedPage } };

  try {
    const params = [];
    const clauses = [];

    if (jurusanTags.length) {
      params.push(jurusanTags);
      clauses.push(`jurusan = ANY($${params.length}::text[])`);
    }

    if (interestsTags.length) {
      params.push(interestsTags);
      const placeholder = `$${params.length}::text[]`;

      if (searchMode === "or") {
        clauses.push(`interests && ${placeholder}`);
      } else {
        clauses.push(`interests @> ${placeholder}`);
      }
    }

    const joiner = searchMode === "or" ? " OR " : " AND ";
    const where = clauses.length ? clauses.join(joiner) : "TRUE";

    params.push(parsedItems);
    params.push(offsetPage);

    const sql = `
        SELECT *, COUNT(*) OVER() AS total_count
        FROM ${tableName}
        WHERE ${where}
        ORDER BY id
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;

    const res = await pool.query(sql, params);
    const rows = res.rows;
    const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
    const totalPages = Math.ceil(total / parsedItems);

    const students = rows.map(({ total_count, ...student }) => student);

    return {
      students,
      meta: {
        total,
        totalPages,
        items: parsedItems,
        page: parsedPage,
      },
    };
  } catch (e) {
    console.error(`Failed getting student by tags: jurusan=${jurusanTags}, interests=${interestsTags}`, e);
    throw e;
  }
}

export async function insertMessage(mahasiswaId, content) {
  const query = `
    INSERT INTO message (mahasiswa_id, content)
    VALUES ($1, $2)
    RETURNING id, mahasiswa_id, content, created_at;
  `;
  const values = [mahasiswaId, content];

  const { rows } = await pool.query(query, values);
  return rows[0];
}