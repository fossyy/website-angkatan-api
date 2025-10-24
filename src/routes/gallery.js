import { Router } from "express";
import { getAllImages } from "../lib/gallery.js";

const router = Router();

router.get("/gallery", async (req, res) => {
    try {
        res.json({
            success: true,
            data: await getAllImages()

        });
    } catch (error) {
        console.error("Error getting student by ID:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan internal server",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
});

export default router;
