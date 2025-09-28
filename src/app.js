import express from "express";
import indexRoutes from "./routes/index.js";
import mahasiswaRoutes from "./routes/mahasiswa.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";
import dotenv from "dotenv";

import { logger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/error.js";
import { corsConfig } from "./middlewares/cors.js";

const app = express();
const file = fs.readFileSync("swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(file);
dotenv.config();


app.use(corsConfig);
app.use(logger);

app.get("/error", (req, res) => {
  throw new Error("Something broke!");
});

app.use("/", indexRoutes);
app.use("/mahasiswa", mahasiswaRoutes);
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerDocument));

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

export default app;
