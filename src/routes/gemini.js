import { Router } from "express";
import { generateContent, generateChat } from "../config/gemini.js";

const router = Router();

/**
 * @swagger
 * /api/gemini/generate:
 *   post:
 *     summary: Generate menggunakan gemini 2.5 flash
 *     tags: [Gemini]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Prompt buat gemini
 *                 example: "Jelaskan Ilmu Komputer Universitas Indonesia"
 *               model:
 *                 type: string
 *                 description: Model Gemini yang digunakan (terbatas ke 2.5 flash kalo gasalah)
 *                 example: "gemini-2.5-flash"
 *                 default: "gemini-2.5-flash"
 *     responses:
 *       200:
 *         description: Berhasil generate konten
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                       example: "apa tah"
 *       400:
 *         description: Invalid Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Prompt harus diisi"
 *       500:
 *         description: Error dari server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/generate", async (req, res) => {
  try {
    const { prompt, model } = req.body;

    // Validasi input
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Prompt harus diisi dan berupa string yang valid",
      });
    }

    // Generate content
    const response = await generateContent(prompt, model);

    res.json({
      success: true,
      data: {
        response,
      },
    });
  } catch (error) {
    console.error("Error di /generate:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error on generating content",
    });
  }
});

/**
 * @swagger
 * /api/gemini/chat:
 *   post:
 *     summary: Multi-turn convo w/Gemini
 *     tags: [Gemini]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Pesan untuk Gemini
 *                 example: "Halo, siapa kamu?"
 *               history:
 *                 type: array
 *                 description: Riwayat chat sebelumnya (opt)
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, model]
 *                       example: "user"
 *                     parts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                             example: "Halo"
 *                 example:
 *                   - role: "user"
 *                     parts:
 *                       - text: "Halo"
 *                   - role: "model"
 *                     parts:
 *                       - text: "Halo! Ada yang bisa saya bantu?"
 *               model:
 *                 type: string
 *                 description: model yg gidugnkan
 *                 example: "gemini-2.5-flash"
 *                 default: "gemini-2.5-flash"
 *     responses:
 *       200:
 *         description: Berhasil chat dengan Gemini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                       example: "placeholder"
 *       400:
 *         description: Invalid req
 *       500:
 *         description: Error dari server
 */
router.post("/chat", async (req, res) => {
  try {
    const { message, history, model } = req.body;

    // Validasi input
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message harus diisi dan berupa string yang valid",
      });
    }

    // Validasi history jika ada
    if (history && !Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        error: "History harus array",
      });
    }

    // Generate chat response
    const result = await generateChat(history || [], message, model);

    res.json({
      success: true,
      data: {
        response: result.text,
      },
    });
  } catch (error) {
    console.error("Error di /chat:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Terjadi kesalahan saat chat",
    });
  }
});

/**
 * @swagger
 * /api/gemini/health:
 *   get:
 *     summary: CheckHealth
 *     tags: [Gemini]
 *     responses:
 *       200:
 *         description: API Gemini berjalan dengan baik
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Gemini API is healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-26T06:09:42.000Z"
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Gemini API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
