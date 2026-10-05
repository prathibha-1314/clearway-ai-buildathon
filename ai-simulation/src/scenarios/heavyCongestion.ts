import type {
  Ambulance,
  Point,
  ScenarioConfig,
  Vehicle,
} from "../types/simulation";

const SEED = "BUILDATHON-001";

function createAmbulance(): Ambulance {
  const route: Point[] = [
    { x: 0, y: 50 },
    { x: 20, y: 50 },
    { x: 40, y: 50 },
    { x: 60, y: 50 },
    { x: 80, y: 50 },
    { x: 100, y: 50 },
  ];

  return {
    id: "AMB-001",
    x: 0,
    y: 50,
    speed: 12,
    heading: 0,
    status: "moving",
    route,
    predictedRoute: [...route],
  };
}

function createVehicle(
  id: string,
  x: number,
  y: number,
  speed: number,
  heading: number,
  lane: number,
): Vehicle {
  return {
    id,
    x,
    y,
    speed,
    heading,
    lane,

    distanceToAmbulance: 0,
    routeOverlap: 0,
    headingMatch: 0,
    timeToConflict: Infinity,
    conflictScore: 0,

    status: "normal",
    selected: false,
    guided: false,
  };
}

export function createHeavyCongestionScenario(): ScenarioConfig {
  const ambulance = createAmbulance();

  const vehicles: Vehicle[] = [
    createVehicle("V-001", 25, 49, 7, 0, 1),
    createVehicle("V-002", 30, 51, 6, 0, 1),
    createVehicle("V-003", 35, 48, 8, 0, 1),
    createVehicle("V-004", 42, 52, 7, 0, 1),

    createVehicle("V-005", 28, 43, 8, 0, 2),
    createVehicle("V-006", 38, 44, 7, 0, 2),
    createVehicle("V-007", 48, 45, 6, 0, 2),
    createVehicle("V-008", 55, 43, 8, 0, 2),

    createVehicle("V-009", 32, 57, 7, 0, 3),
    createVehicle("V-010", 40, 56, 6, 0, 3),
    createVehicle("V-011", 50, 58, 8, 0, 3),
    createVehicle("V-012", 60, 57, 7, 0, 3),

    createVehicle("V-013", 15, 35, 10, 0, 2),
    createVehicle("V-014", 70, 35, 9, 0, 2),
    createVehicle("V-015", 20, 65, 9, 0, 3),
    createVehicle("V-016", 75, 65, 10, 0, 3),
  ];

  return {
    scenario: "heavy-congestion",
    seed: SEED,
    vehicleCount: vehicles.length,
    laneCount: 3,
    ambulance,
    vehicles,
  };
}
