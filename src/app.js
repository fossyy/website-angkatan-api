import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import indexRoutes from "./routes/index.js";
import geminiRoutes from "./routes/gemini.js";

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// swagger docs fr
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/", indexRoutes);
app.use("/api/gemini", geminiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// errhandling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

export default app;
