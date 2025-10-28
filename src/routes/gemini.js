import { Router } from "express";
import { generateContent, generateChat } from "../lib/gemini.js";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const prompt = req.body;
    console.log(prompt)
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Prompt harus diisi dan berupa string yang valid",
      });
    }

    const response = await generateContent(prompt, "gemini-2.5-flash");

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

export default router;
