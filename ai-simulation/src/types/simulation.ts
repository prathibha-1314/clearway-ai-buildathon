export interface Point {
  x: number;
  y: number;
}

export type VehicleStatus =
  | "NORMAL"
  | "CONFLICT_DETECTED"
  | "SELECTED"
  | "GUIDED"
  | "MOVING_ASIDE"
  | "CLEARED";

export interface Vehicle {
  id: string;
  position: Point;
  speed: number;
  heading: number;
  lane: number;

  status: VehicleStatus;

  conflictScore: number;
  selected: boolean;
  guided: boolean;

  distanceToRoute: number;
  routeOverlap: number;
  headingMatch: number;
  timeToConflict: number;
}

export interface Ambulance {
  id: string;
  position: Point;
  speed: number;
  heading: number;
  status: "MOVING" | "STOPPED" | "COMPLETED";
  route: Point[];
  predictedRoute: Point[];
}

export interface DTEC {
  id: string;
  status: "ACTIVE" | "RELEASED";
  center: Point;
  length: number;
  width: number;
  routeSegment: Point[];
  vehicleIds: string[];
}

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

export type SimulationMode = "BASELINE" | "CLEARWAY";

export interface SimulationMetrics {
  ambulancePassageDelay: number;
  clearanceTime: number;
  conflictingVehicles: number;
  selectedVehicles: number;
  guidedVehicles: number;
  unnecessaryAlerts: number;
}
