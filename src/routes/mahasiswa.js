import { Router } from "express";

const router = Router();

// List mahasiswa (default)
router.get("/", async (req, res) => {
  const {page, search} = req.query

  res.json(req.query);
  // respons yg dibutuhkan: data2 mahasiswa sesuai page, jumlah page, ___
  // res.json(getMahasiswa(page, search)); // Function untuk query dari database akan segera datang!!!
});

export default router;