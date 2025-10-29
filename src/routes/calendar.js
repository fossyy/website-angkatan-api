import { Router } from "express";
import { google } from "googleapis";
import { getEvents } from "../lib/calendar.js";

const router = Router();

// Middleware utk cek validitas parameter
function validateParams(validations) {
  for (const validation of validations) {
    if (!Number.isInteger(validation.value) || validation.value <= 0) {
      throw new Error(`${validation.field} harus berupa integer positif`);
    }
    if (validation.max && validation.value > validation.max) {
      throw new Error(`${validation.field} tidak valid (harus antara ${validation.min}-${validation.max})`);
    }
  }
  return true
}

// list event-event pada setiap tanggal dalam bulan & tahun yang ditentukan
router.get("/:year/:month", async (req, res) => {
  const { year, month } = req.params
  
  // Blok validasi parameter
  const parsedYear = parseInt(year, 10)
  const parsedMonth = parseInt(month, 10)

  const validations = [
    { value: parsedYear, field: "Tahun", min: 1 },
    { value: parsedMonth, field: "Bulan", min: 1, max: 12 },
  ];
  try {
    validateParams(validations);
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }

  // Blok query data
  try {
    const events = await getEvents(parsedYear, parsedMonth)

    // Grouping per tanggal
    const eventsByDate = events.reduce((groups, event) => {
      const date = event.startDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    }, {});

    return res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan data events",
        data: eventsByDate,
      });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
      error: process.env.NODE_ENV === "development" ? e.message : undefined,
    });
  }
});

// TODO: ...disatuin gak ya
// list event-event di tanggal yang dipilih
router.get("/:year/:month/:date", async (req, res) => {
  const { year, month, date } = req.params
  
  // Blok validasi parameter
  const parsedYear = parseInt(year, 10)
  const parsedMonth = parseInt(month, 10)
  const parsedDate = parseInt(date, 10)

  const validations = [
    { value: parsedYear, field: "Tahun", min: 1 },
    { value: parsedMonth, field: "Bulan", min: 1, max: 12 },
    { value: parsedDate, field: "Tanggal", min: 1, max: 31 }
  ];
  try {
    validateParams(validations);
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }

  // Blok query data
  try {
    const events = await getEvents(parsedYear, parsedMonth, parsedDate)

    return res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan data events",
        data: events,
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
