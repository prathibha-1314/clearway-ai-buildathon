import type {
  Ambulance,
  Vehicle,
  VehicleDecision,
} from "../types/simulation";

const SELECTION_THRESHOLD = 0.65;

const MAX_CONFLICT_DISTANCE = 100;
const MAX_TIME_TO_CONFLICT = 10;

const WEIGHTS = {
  distance: 0.25,
  routeOverlap: 0.30,
  headingMatch: 0.20,
  timeToConflict: 0.25,
} as const;

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts distance into a 0–1 conflict contribution.
 *
 * Closer vehicle = higher conflict.
 */
function normalizeDistance(distance: number): number {
  return 1 - clamp(distance / MAX_CONFLICT_DISTANCE);
}

/**
 * Converts time-to-conflict into a 0–1 urgency contribution.
 *
 * Less time remaining = higher conflict.
 */
function normalizeTimeToConflict(timeToConflict: number): number {
  if (!Number.isFinite(timeToConflict)) {
    return 0;
  }

  return 1 - clamp(timeToConflict / MAX_TIME_TO_CONFLICT);
}

export function calculateConflictScore(vehicle: Vehicle): number {
  const distanceScore = normalizeDistance(vehicle.distanceToAmbulance);

  const routeOverlapScore = clamp(vehicle.routeOverlap);

  const headingMatchScore = clamp(vehicle.headingMatch);

  const timeToConflictScore = normalizeTimeToConflict(
    vehicle.timeToConflict,
  );

  const score =
    WEIGHTS.distance * distanceScore +
    WEIGHTS.routeOverlap * routeOverlapScore +
    WEIGHTS.headingMatch * headingMatchScore +
    WEIGHTS.timeToConflict * timeToConflictScore;

  return Number(clamp(score).toFixed(3));
}

export function getPriority(
  conflictScore: number,
): VehicleDecision["priority"] {
  if (conflictScore >= 0.8) {
    return "high";
  }

  if (conflictScore >= 0.5) {
    return "medium";
  }

  return "low";
}

export function createVehicleDecision(
  vehicle: Vehicle,
  _ambulance: Ambulance,
): VehicleDecision {
  const conflictScore = calculateConflictScore(vehicle);

  return {
    vehicleId: vehicle.id,
    conflictScore,
    priority: getPriority(conflictScore),
    selected: conflictScore >= SELECTION_THRESHOLD,
  };
}

export function calculateVehicleDecisions(
  ambulance: Ambulance,
  vehicles: Vehicle[],
): VehicleDecision[] {
  return vehicles.map((vehicle) =>
    createVehicleDecision(vehicle, ambulance),
  );
}
