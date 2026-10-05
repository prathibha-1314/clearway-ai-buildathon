import type { Ambulance, Vehicle } from "../types/simulation";

export type ConflictFeatures = Vehicle & {
  distanceToAmbulance: number;
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function calculateRouteDistance(
  ambulance: Ambulance,
  vehicle: Vehicle,
): number {
  return ambulance.route.reduce((closest, point) => {
    return Math.min(
      closest,
      distance(
        vehicle.position.x,
        vehicle.position.y,
        point.x,
        point.y,
      ),
    );
  }, Infinity);
}

function calculateRouteOverlap(
  ambulance: Ambulance,
  vehicle: Vehicle,
): number {
  const distanceToRoute = calculateRouteDistance(
    ambulance,
    vehicle,
  );

  // Vehicles close to the ambulance route have greater route overlap.
  return clamp(1 - distanceToRoute / 30);
}

function calculateHeadingMatch(
  ambulance: Ambulance,
  vehicle: Vehicle,
): number {
  const difference = Math.abs(
    ambulance.heading - vehicle.heading,
  );

  const normalizedDifference = Math.min(
    difference,
    360 - difference,
  );

  return clamp(1 - normalizedDifference / 180);
}

function calculateTimeToConflict(
  ambulance: Ambulance,
  vehicle: Vehicle,
  distanceToAmbulance: number,
): number {
  const relativeSpeed = Math.max(
    ambulance.speed - vehicle.speed,
    0.1,
  );

  return distanceToAmbulance / relativeSpeed;
}

export function calculateConflictFeatures(
  ambulance: Ambulance,
  vehicle: Vehicle,
): ConflictFeatures {
  const distanceToAmbulance = distance(
    ambulance.position.x,
    ambulance.position.y,
    vehicle.position.x,
    vehicle.position.y,
  );

  const distanceToRoute = calculateRouteDistance(
    ambulance,
    vehicle,
  );

  const routeOverlap = calculateRouteOverlap(
    ambulance,
    vehicle,
  );

  const headingMatch = calculateHeadingMatch(
    ambulance,
    vehicle,
  );

  const timeToConflict = calculateTimeToConflict(
    ambulance,
    vehicle,
    distanceToAmbulance,
  );

  return {
    ...vehicle,
    distanceToRoute: Number(
      distanceToRoute.toFixed(3),
    ),
    routeOverlap: Number(
      routeOverlap.toFixed(3),
    ),
    headingMatch: Number(
      headingMatch.toFixed(3),
    ),
    timeToConflict: Number(
      timeToConflict.toFixed(3),
    ),
    distanceToAmbulance: Number(
      distanceToAmbulance.toFixed(3),
    ),
  };
}

export function calculateAllConflictFeatures(
  ambulance: Ambulance,
  vehicles: Vehicle[],
): ConflictFeatures[] {
  return vehicles.map((vehicle) =>
    calculateConflictFeatures(
      ambulance,
      vehicle,
    ),
  );
}
