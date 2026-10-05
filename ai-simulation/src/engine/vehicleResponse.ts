import type { Vehicle } from "../types/simulation";

export function applyVehicleDecision(
  vehicle: Vehicle,
  selected: boolean,
): Vehicle {
  if (!selected) {
    return {
      ...vehicle,
      selected: false,
      guided: false,
      status: "normal",
    };
  }

  return {
    ...vehicle,
    selected: true,
    guided: true,
    status: "guided",
  };
}

export function moveVehicleAside(
  vehicle: Vehicle,
): Vehicle {
  if (!vehicle.guided) {
    return vehicle;
  }

  return {
    ...vehicle,
    status: "moving_aside",
    speed: Math.max(vehicle.speed * 0.5, 2),
  };
}

export function clearVehicle(
  vehicle: Vehicle,
): Vehicle {
  return {
    ...vehicle,
    status: "cleared",
    selected: false,
    guided: false,
  };
}

