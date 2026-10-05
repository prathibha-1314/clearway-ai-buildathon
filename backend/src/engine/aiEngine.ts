import { Ambulance } from "../models/ambulance";
import { DTEC } from "../models/dtec";
import { Vehicle } from "../models/vehicle";

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

export function runAITick(input: AITickInput): AITickOutput {
  return {
    predictedRoute: input.ambulance.predictedRoute,
    decisions: [],
    dtec: input.currentDTEC
  };
}