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

export type SimulationMode = "BASELINE" | "CLEARWAY";

export type SimulationStatus =
  | "IDLE"
  | "RUNNING"
  | "ANALYZING"
  | "DTEC_ACTIVE"
  | "GUIDANCE"
  | "AMBULANCE_PASSING"
  | "COMPLETED";

export interface Notification {
  id: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS";
  timestamp: number;
}

export interface SimulationMetrics {
  ambulancePassageDelay: number;
  clearanceTime: number;
  conflictingVehicles: number;
  selectedVehicles: number;
  guidedVehicles: number;
  unnecessaryAlerts: number;
}

export interface SimulationResults extends SimulationMetrics {
  sessionId: string;
  mode: SimulationMode;
  passageDelayDifference: number;
  improvementPercent: number;
}

export interface SimulationState {
  sessionId: string;
  mode: SimulationMode;
  status: SimulationStatus;
  time: number;
  ambulance: Ambulance;
  vehicles: Vehicle[];
  dtec: DTEC | null;
  notifications: Notification[];
  results: SimulationResults | null;
}

export interface SimulationStartRequest {
  scenario: "heavy-congestion";
  seed: "BUILDATHON-001";
  mode: SimulationMode;
}