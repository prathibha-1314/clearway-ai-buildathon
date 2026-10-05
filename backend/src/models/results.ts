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
  mode: "BASELINE" | "CLEARWAY";

  passageDelayDifference: number;
  improvementPercent: number;
}