import { Router } from "express";
import {getStudents} from "../lib/students.js";

const router = Router();

// List mahasiswa (default)
router.get("/", async (req, res) => {
  const {items, page} = req.query

  res.json(await getStudents(items, page));
});

export default router;