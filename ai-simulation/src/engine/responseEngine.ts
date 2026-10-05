import type {
  Vehicle,
  VehicleDecision,
} from "../types/simulation";

import {
  applyVehicleDecision,
  moveVehicleAside,
} from "./vehicleResponse";

export function applyVehicleResponses(
  vehicles: Vehicle[],
  decisions: VehicleDecision[],
): Vehicle[] {
  return vehicles.map((vehicle) => {
    const decision = decisions.find(
      (item) => item.vehicleId === vehicle.id,
    );

    if (!decision) {
      return vehicle;
    }

    const updatedVehicle = applyVehicleDecision(
      vehicle,
      decision.selected,
    );

    if (!decision.selected) {
      return updatedVehicle;
    }

    return moveVehicleAside(updatedVehicle);
  });
}
