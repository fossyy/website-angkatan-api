import express from "express";
import indexRoutes from "./routes/index.js";
import mahasiswaRoutes from "./routes/mahasiswa.js";
import calendarRoutes from "./routes/calendar.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";

const app = express();
const file = fs.readFileSync("swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(file);

app.use(express.json());

app.use("/", indexRoutes);
app.use("/mahasiswa", mahasiswaRoutes);
app.use("/calendar", calendarRoutes);
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerDocument));

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
