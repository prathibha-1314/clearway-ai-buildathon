import type {
  SimulationMode,
  SimulationResults,
  SimulationStartRequest,
  SimulationState,
} from "../types/simulation";

const API_BASE_URL = "http://localhost:5000/api";

export async function startSimulation(
  mode: SimulationMode,
): Promise<{ success: boolean; sessionId: string; status: string; mode: SimulationMode }> {
  const request: SimulationStartRequest = {
    scenario: "heavy-congestion",
    seed: "BUILDATHON-001",
    mode,
  };

  const response = await fetch(`${API_BASE_URL}/simulation/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to start simulation: ${response.status}`);
  }

  return response.json();
}

export async function getSimulationState(): Promise<SimulationState> {
  const response = await fetch(`${API_BASE_URL}/simulation/state`);

  if (!response.ok) {
    throw new Error(`Failed to fetch simulation state: ${response.status}`);
  }

  return response.json();
}

export async function stopSimulation(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/simulation/stop`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to stop simulation: ${response.status}`);
  }
}

export async function resetSimulation(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/simulation/reset`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to reset simulation: ${response.status}`);
  }
}

export async function getSimulationResults(
  sessionId: string,
): Promise<SimulationResults> {
  const response = await fetch(
    `${API_BASE_URL}/results/${sessionId}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch simulation results: ${response.status}`);
  }

  return response.json();
}
