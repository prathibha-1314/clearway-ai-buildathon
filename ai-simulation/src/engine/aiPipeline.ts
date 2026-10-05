import type {
  Ambulance,
  DTEC,
  SimulationMetrics,
  Vehicle,
} from "../types/simulation";

import {
  runDecisionEngine,
} from "./decisionEngine";

import {
  applyVehicleResponses,
} from "./responseEngine";

import {
  createDTECRecommendation,
} from "../dtec/dtecRecommendation";

import {
  calculateMetrics,
} from "../metrics/metricsCalculator";

export interface AIPipelineResult {
  vehicles: Vehicle[];
  dtec: DTEC | null;
  metrics: SimulationMetrics;
}

export function runAIPipeline(
  ambulance: Ambulance,
  vehicles: Vehicle[],
): AIPipelineResult {
  // 1. Calculate conflict features and AI decisions.
  const decisionResult = runDecisionEngine(
    ambulance,
    vehicles,
  );

  // 2. Apply the AI decisions to vehicle responses.
  const updatedVehicles = applyVehicleResponses(
    decisionResult.vehicles,
    decisionResult.decisions,
  );

  // 3. Build the dynamic emergency corridor.
  const dtec = createDTECRecommendation(
    ambulance,
    updatedVehicles,
  );

  // 4. Calculate current simulation metrics.
  const metrics = calculateMetrics(
    updatedVehicles,
    0,
    0,
  );

  return {
    vehicles: updatedVehicles,
    dtec,
    metrics,
  };
}

