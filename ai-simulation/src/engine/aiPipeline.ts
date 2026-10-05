import type {
  Ambulance,
  DTEC,
  SimulationMetrics,
  Vehicle,
} from "../types/simulation";

import { runDecisionEngine } from "./decisionEngine";

import { createDTECRecommendation } from "../dtec/dtecRecommendation";

import { calculateMetrics } from "../metrics/metricsCalculator";

export interface AIPipelineResult {
  vehicles: Vehicle[];
  dtec: DTEC | null;
  metrics: SimulationMetrics;
}

export function runAIPipeline(
  ambulance: Ambulance,
  vehicles: Vehicle[],
): AIPipelineResult {
  // 1. Calculate conflict features and current-tick AI decisions.
  const decisionResult = runDecisionEngine(
    ambulance,
    vehicles,
  );

  // 2. Build DTEC from the CURRENT decisions.
  // Do not use stale vehicle.selected state from previous ticks.
  const dtec = createDTECRecommendation(
    ambulance,
    decisionResult.vehicles,
    decisionResult.decisions,
  );

  // 3. Metrics are kept only as a local/test utility.
  // The backend remains responsible for final simulation metrics.
  const metrics = calculateMetrics(
    decisionResult.vehicles,
    0,
    0,
  );

  return {
    vehicles: decisionResult.vehicles,
    dtec,
    metrics,
  };
}
