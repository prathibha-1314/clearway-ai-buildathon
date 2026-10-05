import { Request, Response } from "express";
import {
  createSimulation,
  getSimulationState,
  resetSimulation,
  stopSimulation,
} from "../services/simulationStore";
import {
  startSimulationLoop,
  stopSimulationLoop,
} from "../services/simulationLoop";
import { SimulationMode } from "../models/simulation";

export function startSimulation(req: Request, res: Response) {
  const { scenario, mode } = req.body;

  if (scenario !== "heavy-congestion") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_SCENARIO",
        message: "Only heavy-congestion is supported",
      },
    });
  }

  if (mode !== "BASELINE" && mode !== "CLEARWAY") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_MODE",
        message: "Mode must be BASELINE or CLEARWAY",
      },
    });
  }

  const currentState = getSimulationState();

  if (currentState && currentState.status !== "COMPLETED") {
    return res.status(409).json({
      success: false,
      error: {
        code: "SIMULATION_ALREADY_RUNNING",
        message: "A simulation is already running",
      },
    });
  }

  const state = createSimulation(mode as SimulationMode);

  startSimulationLoop();

  return res.json({
    success: true,
    sessionId: state.sessionId,
    status: state.status,
    mode: state.mode,
  });
}

export function getState(_req: Request, res: Response) {
  const state = getSimulationState();

  if (!state) {
    return res.status(404).json({
      success: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: "Simulation session not found",
      },
    });
  }

  return res.json({
    success: true,
    ...state,
  });
}

export function stop(_req: Request, res: Response) {
  const state = stopSimulation();

  if (!state) {
    return res.status(404).json({
      success: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: "Simulation session not found",
      },
    });
  }

  stopSimulationLoop();

  return res.json({
    success: true,
    sessionId: state.sessionId,
    status: state.status,
  });
}

export function reset(_req: Request, res: Response) {
  stopSimulationLoop();
  resetSimulation();

  return res.json({
    success: true,
    message: "Simulation reset successfully",
  });
}