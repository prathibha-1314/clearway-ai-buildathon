import { runAITick } from "../engine/aiEngine";
import {
  getSimulationState,
  updateSimulationState,
} from "./simulationStore";

const TICK_MS = 100;

let interval: NodeJS.Timeout | null = null;

export function startSimulationLoop(): void {
  if (interval) {
    return;
  }

  interval = setInterval(() => {
    const state = getSimulationState();

    if (!state || state.status === "COMPLETED") {
      stopSimulationLoop();
      return;
    }

    const deltaTime = TICK_MS / 1000;

    const ambulance = {
      ...state.ambulance,
      position: {
        ...state.ambulance.position,
        x:
          state.ambulance.position.x +
          state.ambulance.speed * deltaTime,
      },
    };

    const vehicles = state.vehicles.map((vehicle) => ({
      ...vehicle,
      position: {
        ...vehicle.position,
        x:
          vehicle.position.x +
          vehicle.speed * deltaTime,
      },
    }));

    const aiOutput = runAITick({
      ambulance,
      vehicles,
      currentDTEC: state.dtec,
      time: state.time + deltaTime,
    });

    const updatedVehicles = vehicles.map((vehicle) => {
      const decision = aiOutput.decisions.find(
        (item) => item.vehicleId === vehicle.id
      );

      if (!decision) {
        return vehicle;
      }

      return {
        ...vehicle,
        conflictScore: decision.conflictScore,
        selected: decision.selected,
        status: decision.selected
          ? "SELECTED"
          : vehicle.status,
      };
    });

    updateSimulationState({
      time: state.time + deltaTime,
      ambulance: {
        ...ambulance,
        predictedRoute: aiOutput.predictedRoute,
      },
      vehicles: updatedVehicles,
      dtec: aiOutput.dtec,
    });
  }, TICK_MS);
}

export function stopSimulationLoop(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}