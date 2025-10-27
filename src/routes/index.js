import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Endpoint root untuk testing
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gemini API is running"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 documentation:
 *                   type: string
 *                   example: "/api-docs"
 */
router.get("/", (req, res) => {
  res.json({
    message: "Gemini API is running",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

export default router;
