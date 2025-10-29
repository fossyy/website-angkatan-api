import { Router } from "express";
import { getStudents, getStudentById, getStudentByTags, insertMessage } from "../lib/students.js";

const router = Router();

// List mahasiswa (default)
router.get("/", async (req, res) => {
  const { items, page } = req.query

  res.json(await getStudents(items, page));
});

// Get mahasiswa by tags
router.get("/tags", async (req, res) => {
  const jurusanList = new Set(["Ilmu Komputer", "Sistem Informasi", "Ilmu Komputer KKI"]);

  try {
    const { tags, mode, items, page } = req.query;

    if (!tags) {
      return res.status(400).json({
        success: false,
        message: "Query tags malformed",
      })
    }

    const parsedTags = Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : String(tags).split(",").map(t => t.trim()).filter(Boolean);

    const jurusanTags = parsedTags.filter(t => jurusanList.has(t));
    const interestsTags = parsedTags.filter(t => !jurusanList.has(t));
    const searchMode = (mode && mode.toLowerCase() === "or") ? "or" : "and";

    const students = await getStudentByTags(jurusanTags, interestsTags, searchMode, items, page);

    if (!students || students.students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada mahasiswa dengan tags tersebut",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil ditemukan",
      students: students.students,
      meta: students.meta,
    });
  } catch (error) {
    console.error("Error getting student by tags:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Get mahasiswa by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validasi apakah ID adalah number
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID mahasiswa harus berupa angka yang valid",
      });
    }

    const student = await getStudentById(id);

    // Cek apakah mahasiswa ditemukan
    if (!student || student.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Mahasiswa dengan ID ${id} tidak ditemukan`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil ditemukan",
      data: student,
    });
  } catch (error) {
    console.error("Error getting student by ID:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/message", async (req, res) => {
  try {
    const data = await insertMessage(req.body.mahasiswa_id, req.body.content)
    res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil ditemukan",
      data: data,
    });
  } catch (error) {
    console.error("Error getting student by ID:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
