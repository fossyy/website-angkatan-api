import express from "express";
import mahasiswaRoutes from "./routes/mahasiswa.js";
import galleryRoute from "./routes/gallery.js"
import arunglinkRoute from "./routes/arunglink.js";
import calendarRoutes from "./routes/calendar.js";
import swaggerUi from "swagger-ui-express";
import aiRoutes from "./routes/ai.js"
import YAML from "yaml";
import fs from "fs";
import dotenv from "dotenv";

import { logger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/error.js";
import { corsConfig } from "./middlewares/cors.js";
import { restrictInProd } from "./middlewares/prod.js";

import { startBot } from "./lib/bot/main.js";

const app = express();
const file = fs.readFileSync("swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(file);
dotenv.config();

app.use(corsConfig);
app.use(logger);
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/mahasiswa", mahasiswaRoutes);
app.get("/gallery", galleryRoute)
app.use("/arunglink", arunglinkRoute);
app.use("/ai", aiRoutes);
app.use("/calendar", calendarRoutes);
app.use("/api-docs", restrictInProd, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

startBot(process.env.DISCORD_BOT_TOKEN, process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID)

export default app;
