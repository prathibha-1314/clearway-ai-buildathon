import type {
  SimulationMetrics,
  Vehicle,
} from "../types/simulation";

export function calculateMetrics(
  vehicles: Vehicle[],
  passageDelay: number,
  clearanceTime: number,
): SimulationMetrics {
  const vehiclesDetected = vehicles.filter(
    (vehicle) => vehicle.status !== "normal",
  ).length;

  const vehiclesSelected = vehicles.filter(
    (vehicle) => vehicle.selected,
  ).length;

  const vehiclesGuided = vehicles.filter(
    (vehicle) => vehicle.guided,
  ).length;

  const unnecessaryAlerts = vehicles.filter(
    (vehicle) =>
      vehicle.guided &&
      vehicle.conflictScore < 0.65,
  ).length;

  return {
    passageDelay,
    clearanceTime,
    vehiclesDetected,
    vehiclesSelected,
    vehiclesGuided,
    unnecessaryAlerts,
  };
}
