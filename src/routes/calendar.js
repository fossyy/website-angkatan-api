import { Router } from "express";
import { google } from "googleapis";
import { getEventsPerMonth } from "../lib/calendar.js";

const router = Router();

// list event-event pada setiap tanggal dalam bulan & tahun yang ditentukan
router.get("/:year/:month", async (req, res) => {
  const { year, month } = req.params
  
  const parsedYear = parseInt(year, 10)
  const parsedMonth = parseInt(month, 10)

  if (!Number.isInteger(parsedYear) || parsedYear <= 0) {
    return res.status(400).json({
      success: false,
      message: "Tahun harus berupa integer positif",
    });
  }
  if (!Number.isInteger(parsedMonth) || parsedMonth <= 0) {
    return res.status(400).json({
      success: false,
      message: "Bulan harus berupa integer positif",
    });
  }

  try {
    const events = await getEventsPerMonth(2025, 9)

    return res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan data events",
        data: events, // Ambil data pertama karena getStudentById return array
      });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
      error: process.env.NODE_ENV === "development" ? e.message : undefined,
    });
  }
});

// list event-event di tanggal yang dipilih
router.get("/:year/:month/:date", async (req, res) => {
  const { year, month, date } = req.params
  
  const parsedYear = parseInt(year, 10)
  const parsedMonth = parseInt(month, 10)
  const parsedDate = parseInt(date, 10)

  const validations = [
    { value: parsedYear, field: "Tahun", min: 1 },
    { value: parsedMonth, field: "Bulan", min: 1, max: 12 },
    { value: parsedDate, field: "Tanggal", min: 1, max: 31 }
  ];

  for (const validation of validations) {
    if (!Number.isInteger(validation.value) || validation.value <= 0) {
      return res.status(400).json({
        success: false,
        message: `${validation.field} harus berupa integer positif`,
      });
    }
    if (validation.max && validation.value > validation.max) {
      return res.status(400).json({
        success: false,
        message: `${validation.field} tidak valid (harus antara ${validation.min}-${validation.max})`,
      });
    }
  }

  try {
    const events = await getEventsPerMonth(2025, 9)

    return res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan data events",
        data: events, // Ambil data pertama karena getStudentById return array
      });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
      error: process.env.NODE_ENV === "development" ? e.message : undefined,
    });
  }
});

export default router;
