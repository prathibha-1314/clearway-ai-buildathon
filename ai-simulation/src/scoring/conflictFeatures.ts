import type { Ambulance, Vehicle } from "../types/simulation";

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

function calculateRouteOverlap(
  ambulance: Ambulance,
  vehicle: Vehicle,
): number {
  const distanceToRoute = ambulance.route.reduce((closest, point) => {
    return Math.min(
      closest,
      distance(vehicle.x, vehicle.y, point.x, point.y),
    );
  }, Infinity);

  // Vehicles close to the ambulance route have greater route overlap.
  return clamp(1 - distanceToRoute / 30);
}

function calculateHeadingMatch(
  ambulance: Ambulance,
  vehicle: Vehicle,
): number {
  const difference = Math.abs(ambulance.heading - vehicle.heading);
  const normalizedDifference = Math.min(difference, 360 - difference);

  return clamp(1 - normalizedDifference / 180);
}

function calculateTimeToConflict(
  ambulance: Ambulance,
  vehicle: Vehicle,
): number {
  const distanceToAmbulance = distance(
    ambulance.x,
    ambulance.y,
    vehicle.x,
    vehicle.y,
  );

  const relativeSpeed = Math.max(
    ambulance.speed - vehicle.speed,
    0.1,
  );

  return distanceToAmbulance / relativeSpeed;
}

export function calculateConflictFeatures(
  ambulance: Ambulance,
  vehicle: Vehicle,
): Vehicle {
  const distanceToAmbulance = distance(
    ambulance.x,
    ambulance.y,
    vehicle.x,
    vehicle.y,
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
  );

  return {
    ...vehicle,
    distanceToAmbulance: Number(distanceToAmbulance.toFixed(3)),
    routeOverlap: Number(routeOverlap.toFixed(3)),
    headingMatch: Number(headingMatch.toFixed(3)),
    timeToConflict: Number(timeToConflict.toFixed(3)),
  };
}

export function calculateAllConflictFeatures(
  ambulance: Ambulance,
  vehicles: Vehicle[],
): Vehicle[] {
  return vehicles.map((vehicle) =>
    calculateConflictFeatures(ambulance, vehicle),
  );
}

