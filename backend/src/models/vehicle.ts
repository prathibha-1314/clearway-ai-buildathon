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