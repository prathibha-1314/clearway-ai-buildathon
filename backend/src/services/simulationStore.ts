import { DTEC } from "../models/dtec";
import { Notification } from "../models/notification";
import { SimulationResults } from "../models/results";
import {
  SimulationMode,
  SimulationState,
} from "../models/simulation";
import { createInitialScenario } from "./scenarioService";

let state: SimulationState | null = null;

let sessionCounter = 0;

export function createSimulation(
  mode: SimulationMode
): SimulationState {
  sessionCounter += 1;

  const { ambulance, vehicles } = createInitialScenario();

  state = {
    sessionId: `SESSION-${String(sessionCounter).padStart(3, "0")}`,
    mode,
    status: "RUNNING",
    time: 0,

    ambulance,
    vehicles,

    dtec: null,
    notifications: [],

    results: null,
  };

  return state;
}

export function getSimulationState(): SimulationState | null {
  return state;
}

export function updateSimulationState(
  updates: Partial<SimulationState>
): SimulationState | null {
  if (!state) {
    return null;
  }

  state = {
    ...state,
    ...updates,
  };

  return state;
}

export function setDTEC(dtec: DTEC | null): void {
  if (state) {
    state.dtec = dtec;
  }
}

export function setNotifications(
  notifications: Notification[]
): void {
  if (state) {
    state.notifications = notifications;
  }
}

export function setResults(
  results: SimulationResults
): void {
  if (state) {
    state.results = results;
    state.status = "COMPLETED";
  }
}

export function resetSimulation(): void {
  state = null;
}

export function stopSimulation(): SimulationState | null {
  if (state && state.status !== "COMPLETED") {
    state.status = "COMPLETED";
  }

  return state;
}