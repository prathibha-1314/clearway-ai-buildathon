import type {
  Ambulance,
  Vehicle,
  VehicleDecision,
} from "../types/simulation";

import {
  calculateAllConflictFeatures,
} from "../scoring/conflictFeatures";

import {
  calculateVehicleDecisions,
} from "../scoring/conflictScore";

export interface DecisionResult {
  vehicles: Vehicle[];
  decisions: VehicleDecision[];
}

export function runDecisionEngine(
  ambulance: Ambulance,
  vehicles: Vehicle[],
): DecisionResult {
  // 1. Calculate conflict features for every vehicle.
  const vehiclesWithFeatures =
    calculateAllConflictFeatures(
      ambulance,
      vehicles,
    );

  // 2. Calculate conflict scores and selection decisions.
  const decisions =
    calculateVehicleDecisions(
      ambulance,
      vehiclesWithFeatures,
    );

  // 3. Store the AI score and selection decision
  //    back on each vehicle.
  const vehiclesWithScores: Vehicle[] =
    vehiclesWithFeatures.map((vehicle) => {
      const decision = decisions.find(
        (item) => item.vehicleId === vehicle.id,
      );

      if (!decision) {
        return vehicle;
      }

      return {
        ...vehicle,
        conflictScore: decision.conflictScore,
        selected: decision.selected,
        status: decision.selected
          ? ("selected" as const)
          : ("normal" as const),
      };
    });

  return {
    vehicles: vehiclesWithScores,
    decisions,
  };
}
