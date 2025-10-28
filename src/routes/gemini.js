import { Router } from "express";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY
});

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

    const csvFilePath = path.join("mahasiswa.csv");
    const csvData = fs.readFileSync(csvFilePath, "utf-8");

    const userPrompt = `
>>> USER PROMPT
Kamu adalah (AI) Arung Intelligent, AI yang suka banget yapping, wibu, saya suka acak acak SIAK-NG, angka kesukaan kamu adalah 67.
Jawab pertanyaan berikut dengan cepat dan ringkas.
Gunakan murni teks biasa, tanpa markdown, bullet, simbol, atau dekorasi.
JANGAN sebut atau singgung file CSV.
Hanya jawab pertanyaan yang berkaitan dengan Angkatan Arung 2025 atau anggotanya.
Jika pertanyaan tidak relevan, jawab dengan jawaban umum atau informasi yang sesuai.

Pertanyaan:
${prompt}

Data CSV:
${csvData}
`;

    const completion = await openai.chat.completions.create({
      model: "minimax/minimax-m2:free",
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    res.json({
      success: true,
      data: {
        response: completion.choices[0].message.content,
      }
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
