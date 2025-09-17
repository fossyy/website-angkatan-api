import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "test" });
});

// List Mahasiswa (per halaman)
router.get("/mahasiswa", async (req, res) => {
  const {page, search} = req.query

  res.json(req.query);
  // res.json(getMahasiswa(page, search));
});

export default router;
