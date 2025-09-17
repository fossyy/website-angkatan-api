import { Router } from "express";
import { sanityCheck } from "../lib/students.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "test" });
});

router.get("/sanity", async (req, res) => {
  res.json(await sanityCheck())
})

export default router;
