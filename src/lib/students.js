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
    const res = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [parsedId]);
    return res.rows;
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