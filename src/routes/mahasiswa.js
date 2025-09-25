import { Router } from "express";
import { getStudents } from "../lib/students.js";
import { getStudentById } from "../lib/students.js";

const router = Router();

// List mahasiswa (default)
router.get("/", async (req, res) => {
  const { items, page } = req.query

  res.json(await getStudents(items, page));
});

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

    // Return data mahasiswa
    res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil ditemukan",
      data: student[0], // Ambil data pertama karena getStudentById return array
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
