import type {
  SimulationMetrics,
  Vehicle,
} from "../types/simulation";

export function calculateMetrics(
  vehicles: Vehicle[],
  ambulancePassageDelay: number,
  clearanceTime: number,
): SimulationMetrics {
  const conflictingVehicles = vehicles.filter(
    (vehicle) => vehicle.status !== "NORMAL",
  ).length;

  const selectedVehicles = vehicles.filter(
    (vehicle) => vehicle.selected,
  ).length;

  const guidedVehicles = vehicles.filter(
    (vehicle) => vehicle.guided,
  ).length;

  const unnecessaryAlerts = vehicles.filter(
    (vehicle) =>
      vehicle.guided &&
      vehicle.conflictScore < 0.65,
  ).length;

  return {
    ambulancePassageDelay,
    clearanceTime,
    conflictingVehicles,
    selectedVehicles,
    guidedVehicles,
    unnecessaryAlerts,
  };
}
