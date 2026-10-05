import express from "express";
import cors from "cors";
import simulationRoutes from "./routes/simulationRoutes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "clearway-backend",
    status: "ok",
  });
});

app.use("/api/simulation", simulationRoutes);

export default app;