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

function moveAmbulance(
  ambulance: Ambulance,
  deltaTime: number,
): Ambulance {
  const distanceTravelled =
    ambulance.speed * deltaTime;

  return {
    ...ambulance,
    x: ambulance.x + distanceTravelled,
  };
}

export function runSimulationTick(
  ambulance: Ambulance,
  vehicles: Vehicle[],
  deltaTime: number,
): SimulationTickResult {
  // Move the ambulance according to elapsed simulation time.
  const updatedAmbulance = moveAmbulance(
    ambulance,
    deltaTime,
  );

  // Re-run the AI against the new ambulance position.
  const aiResult = runAIPipeline(
    updatedAmbulance,
    vehicles,
  );

  return {
    ambulance: updatedAmbulance,
    vehicles: aiResult.vehicles,
    dtec: aiResult.dtec,
  };
}
