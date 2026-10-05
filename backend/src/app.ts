import * as express from "express";
import * as cors from "cors";

import simulationRoutes from "./routes/simulationRoutes";
import resultsRoutes from "./routes/resultsRoutes";

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

app.use(
  "/api/simulation",
  simulationRoutes
);

app.use(
  "/api/results",
  resultsRoutes
);

export default app;