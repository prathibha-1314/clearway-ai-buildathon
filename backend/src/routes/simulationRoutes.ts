import { Router } from "express";
import {
  startSimulation,
  getState,
  stop,
  reset,
} from "../controllers/simulationController";

const router = Router();

router.post("/start", startSimulation);
router.get("/state", getState);
router.post("/stop", stop);
router.post("/reset", reset);

export default router;