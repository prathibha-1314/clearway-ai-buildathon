import { Ambulance } from "../models/ambulance";
import { DTEC } from "../models/dtec";
import { Vehicle } from "../models/vehicle";

export interface VehicleDecision {
  vehicleId: string;
  conflictScore: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  selected: boolean;
}

export interface AITickInput {
  ambulance: Ambulance;
  vehicles: Vehicle[];
  currentDTEC: DTEC | null;
  time: number;
}

export interface AITickOutput {
  predictedRoute: Ambulance["predictedRoute"];
  decisions: VehicleDecision[];
  dtec: DTEC | null;
}

function calculateConflictScore(
  ambulance: Ambulance,
  vehicle: Vehicle
): number {
  const distanceToRoute = Math.abs(
    vehicle.position.y - ambulance.position.y
  );

  const longitudinalDistance =
    vehicle.position.x - ambulance.position.x;

  // Vehicle is behind the ambulance: no immediate conflict.
  if (longitudinalDistance < 0) {
    return 0;
  }

  // Vehicles far away are lower priority.
  const distanceFactor = Math.max(
    0,
    Math.min(1, 1 - longitudinalDistance / 300)
  );

  // Vehicles on the ambulance's lane are highest risk.
  const routeFactor = Math.max(
    0,
    Math.min(1, 1 - distanceToRoute / 40)
  );

  // Same travel direction increases conflict likelihood.
  const headingDifference = Math.abs(
    ambulance.heading - vehicle.heading
  );

  const normalizedHeadingDifference =
    Math.min(headingDifference, 360 - headingDifference);

  const headingFactor =
    normalizedHeadingDifference <= 30 ? 1 : 0.5;

  const score =
    distanceFactor * 0.45 +
    routeFactor * 0.4 +
    headingFactor * 0.15;

  return Number(Math.max(0, Math.min(1, score)).toFixed(2));
}

function createDTEC(
  ambulance: Ambulance,
  selectedVehicles: Vehicle[]
): DTEC | null {
  if (selectedVehicles.length === 0) {
    return null;
  }

  return {
    id: "DTEC-01",
    status: "ACTIVE",

    center: {
      x: ambulance.position.x + 100,
      y: ambulance.position.y,
    },

    length: 220,
    width: 80,

    routeSegment: ambulance.predictedRoute.slice(0, 4),

    vehicleIds: selectedVehicles.map(
      (vehicle) => vehicle.id
    ),
  };
}

export function runAITick(
  input: AITickInput
): AITickOutput {
  const decisions: VehicleDecision[] = [];

  for (const vehicle of input.vehicles) {
    const conflictScore = calculateConflictScore(
      input.ambulance,
      vehicle
    );

    let priority: "LOW" | "MEDIUM" | "HIGH" = "LOW";

    if (conflictScore >= 0.75) {
      priority = "HIGH";
    } else if (conflictScore >= 0.45) {
      priority = "MEDIUM";
    }

    decisions.push({
      vehicleId: vehicle.id,
      conflictScore,
      priority,
      selected: conflictScore >= 0.65,
    });
  }

  const selectedVehicles = input.vehicles.filter(
    (vehicle) => {
      const decision = decisions.find(
        (item) => item.vehicleId === vehicle.id
      );

      return decision?.selected === true;
    }
  );

  const dtec = createDTEC(
    input.ambulance,
    selectedVehicles
  );

  return {
    predictedRoute: input.ambulance.predictedRoute,
    decisions,
    dtec,
  };
}