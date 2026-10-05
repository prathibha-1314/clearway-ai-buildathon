import { Ambulance } from "../models/ambulance";
import { Vehicle } from "../models/vehicle";

export const SCENARIO_NAME = "heavy-congestion";
export const SCENARIO_SEED = "BUILDATHON-001";

export interface InitialScenario {
  ambulance: Ambulance;
  vehicles: Vehicle[];
}

export function createInitialScenario(): InitialScenario {
  const route = [
    { x: 80, y: 280 },
    { x: 180, y: 280 },
    { x: 280, y: 280 },
    { x: 380, y: 280 },
    { x: 480, y: 280 },
    { x: 580, y: 280 },
  ];

  const ambulance: Ambulance = {
    id: "AMB-01",
    position: { x: 80, y: 280 },
    speed: 42,
    heading: 90,
    status: "MOVING",
    route,
    predictedRoute: [...route],
  };

  const vehicleData = [
    [180, 260, 1, 24],
    [205, 280, 2, 22],
    [225, 300, 3, 26],
    [245, 260, 1, 20],
    [265, 280, 2, 18],
    [285, 300, 3, 24],
    [305, 260, 1, 22],
    [325, 280, 2, 20],
    [345, 300, 3, 25],
    [365, 260, 1, 18],
    [385, 280, 2, 21],
    [405, 300, 3, 23],
    [425, 260, 1, 19],
    [445, 280, 2, 20],
    [465, 300, 3, 24],
    [485, 260, 1, 22],
    [505, 280, 2, 18],
    [525, 300, 3, 21],
    [545, 260, 1, 20],
    [565, 280, 2, 19],
  ];

  const vehicles: Vehicle[] = vehicleData.map(
    ([x, y, lane, speed], index) => ({
      id: `V${String(index + 1).padStart(2, "0")}`,
      position: { x, y },
      speed,
      heading: 90,
      lane,
      status: "NORMAL",

      conflictScore: 0,
      selected: false,
      guided: false,

      distanceToRoute: Math.abs(y - 280),
      routeOverlap: 0,
      headingMatch: 1,
      timeToConflict: 999,
    })
  );

  return {
    ambulance,
    vehicles,
  };
}