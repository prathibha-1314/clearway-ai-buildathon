import type {
  Ambulance,
  DTEC,
  Point,
  Vehicle,
  VehicleDecision,
} from "../types/simulation";

function calculateCenter(
  vehicles: Vehicle[],
  ambulance: Ambulance,
): Point {
  if (vehicles.length === 0) {
    return {
      x: ambulance.position.x,
      y: ambulance.position.y,
    };
  }

  const total = vehicles.reduce(
    (sum, vehicle) => ({
      x: sum.x + vehicle.position.x,
      y: sum.y + vehicle.position.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: Number((total.x / vehicles.length).toFixed(3)),
    y: Number((total.y / vehicles.length).toFixed(3)),
  };
}

export function createDTECRecommendation(
  ambulance: Ambulance,
  vehicles: Vehicle[],
  decisions: VehicleDecision[],
): DTEC | null {
  const selectedIds = new Set(
    decisions
      .filter((decision) => decision.selected)
      .map((decision) => decision.vehicleId),
  );

  const selectedVehicles = vehicles.filter((vehicle) =>
    selectedIds.has(vehicle.id),
  );

  if (selectedVehicles.length === 0) {
    return null;
  }

  const center = calculateCenter(
    selectedVehicles,
    ambulance,
  );

  return {
    id: "DTEC-001",
    status: "ACTIVE",
    center,
    length: 30,
    width: 12,
    routeSegment: ambulance.predictedRoute.slice(0, 3),
    vehicleIds: selectedVehicles.map(
      (vehicle) => vehicle.id,
    ),
  };
}
