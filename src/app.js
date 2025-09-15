import express from "express";
import indexRoutes from "./routes/index.js";

const app = express();

app.use(express.json());

app.use("/", indexRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
