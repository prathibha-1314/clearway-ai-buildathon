import { Point } from "./vehicle";

export type AmbulanceStatus =
  | "MOVING"
  | "STOPPED"
  | "COMPLETED";

export interface Ambulance {
  id: string;
  position: Point;
  speed: number;
  heading: number;
  status: AmbulanceStatus;

  route: Point[];
  predictedRoute: Point[];
}