import { Ambulance } from "./ambulance";
import { DTEC } from "./dtec";
import { Notification } from "./notification";
import { SimulationResults } from "./results";
import { Vehicle } from "./vehicle";

export type SimulationMode = "BASELINE" | "CLEARWAY";

export type SimulationStatus =
  | "IDLE"
  | "RUNNING"
  | "ANALYZING"
  | "DTEC_ACTIVE"
  | "GUIDANCE"
  | "AMBULANCE_PASSING"
  | "COMPLETED";

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