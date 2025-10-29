import express from "express";
import indexRoutes from "./routes/index.js";
import mahasiswaRoutes from "./routes/mahasiswa.js";
import galleryRoute from "./routes/gallery.js"
import arunglinkRoute from "./routes/arunglink.js";
import swaggerUi from "swagger-ui-express";
import geminiRoutes from "./routes/gemini.js"
import YAML from "yaml";
import fs from "fs";
import dotenv from "dotenv";

import { logger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/error.js";
import { corsConfig } from "./middlewares/cors.js";

import { startBot } from "./lib/bot/main.js";

startBot(process.env.BOT_TOKEN, process.env.CLIENT_ID, "857864100973379584")

const app = express();
const file = fs.readFileSync("swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(file);
dotenv.config();

app.use(corsConfig);
app.use(logger);
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", indexRoutes);
app.use("/mahasiswa", mahasiswaRoutes);
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerDocument));
app.get("/gallery", galleryRoute)
app.use("/arunglink", arunglinkRoute);
app.use("/ai", geminiRoutes);
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

export default app;
