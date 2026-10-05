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

  // 2. Calculate conflict scores and current-tick
  //    selection decisions.
  const decisions =
    calculateVehicleDecisions(
      ambulance,
      vehiclesWithFeatures,
    );

  // 3. Keep the vehicle view updated with the AI score
  //    for internal/debugging use only.
  //
  //    Physical status, selected state, movement, speed,
  //    and lane changes are owned by the backend simulation.
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
      };
    });

  return {
    vehicles: vehiclesWithScores,
    decisions,
  };
}
