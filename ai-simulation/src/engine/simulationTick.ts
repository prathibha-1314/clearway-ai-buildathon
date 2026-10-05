import type {
  Ambulance,
  Vehicle,
} from "../types/simulation";

import { runAIPipeline } from "./aiPipeline";

export interface SimulationTickResult {
  ambulance: Ambulance;
  vehicles: Vehicle[];
  dtec: ReturnType<typeof runAIPipeline>["dtec"];
}

export function runSimulationTick(
  ambulance: Ambulance,
  vehicles: Vehicle[],
  _deltaTime: number,
): SimulationTickResult {
  // Physical movement is owned by the backend simulation.
  // This compatibility wrapper only evaluates the AI
  // against the state supplied to it.
  const aiResult = runAIPipeline(
    ambulance,
    vehicles,
  );

  return {
    ambulance,
    vehicles: aiResult.vehicles,
    dtec: aiResult.dtec,
  };
}
