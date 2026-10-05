import type {
  AITickInput,
  AITickOutput,
} from "../types/simulation";

import {
  calculateAllConflictFeatures,
} from "../scoring/conflictFeatures";

import {
  calculateVehicleDecisions,
} from "../scoring/conflictScore";

import {
  createDTECRecommendation,
} from "../dtec/dtecRecommendation";

export function runAITick(
  input: AITickInput,
): AITickOutput {
  // The backend owns physical simulation state.
  // AI only evaluates the state supplied for this tick.

  const predictedRoute =
    input.ambulance.predictedRoute;

  const vehiclesWithFeatures =
    calculateAllConflictFeatures(
      input.ambulance,
      input.vehicles,
    );

  const decisions =
    calculateVehicleDecisions(
      input.ambulance,
      vehiclesWithFeatures,
    );

  const dtec = createDTECRecommendation(
    input.ambulance,
    vehiclesWithFeatures,
    decisions,
  );

  // These are part of the backend contract but are not
  // needed by the current deterministic decision logic.
  void input.currentDTEC;
  void input.time;

  return {
    predictedRoute,
    decisions,
    dtec,
  };
}
