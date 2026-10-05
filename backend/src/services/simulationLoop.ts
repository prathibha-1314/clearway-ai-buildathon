import { runAITick } from "../engine/aiEngine";
import {
  getSimulationState,
  setDTEC,
  setNotifications,
  updateSimulationState,
} from "./simulationStore";

const TICK_MS = 100;
const AMBULANCE_LANE_Y = 280;
const AMBULANCE_SPEED = 42;
const BLOCKING_DISTANCE = 35;
const LANE_SHIFT_SPEED = 80;
const END_X = 580;

let interval: NodeJS.Timeout | null = null;

function getTargetY(lane: number): number {
  if (lane === 1) {
    return 240;
  }

  if (lane === 3) {
    return 320;
  }

  return 260;
}

function findBlockingVehicle(
  ambulanceX: number,
  vehicles: ReturnType<typeof getSimulationState> extends infer T
    ? T extends { vehicles: infer V }
      ? V extends Array<infer U>
        ? U
        : never
      : never
    : never
) {
  return vehicles
    .filter((vehicle) => {
      const sameLane =
        Math.abs(vehicle.position.y - AMBULANCE_LANE_Y) < 8;

      const ahead = vehicle.position.x > ambulanceX;

      const notCleared = vehicle.status !== "CLEARED";

      const notMovingAside =
        vehicle.status !== "MOVING_ASIDE" &&
        vehicle.status !== "GUIDED";

      return (
        sameLane &&
        ahead &&
        notCleared &&
        notMovingAside
      );
    })
    .sort(
      (a, b) =>
        a.position.x - b.position.x
    )[0];
}

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
    const nextTime = state.time + deltaTime;

    let ambulanceSpeed = AMBULANCE_SPEED;

    // ---------------------------------------------------------
    // 1. BASELINE PHYSICS
    // ---------------------------------------------------------
    // In baseline, traffic behaves normally.
    // No AI selection, no guidance, no DTEC.
    // The ambulance slows behind a blocking vehicle.
    // ---------------------------------------------------------

    if (state.mode === "BASELINE") {
      const blocker = findBlockingVehicle(
        state.ambulance.position.x,
        state.vehicles
      );

      if (blocker) {
        const gap =
          blocker.position.x -
          state.ambulance.position.x;

        if (gap <= BLOCKING_DISTANCE) {
          ambulanceSpeed = Math.min(
            AMBULANCE_SPEED,
            blocker.speed
          );
        }
      }
    }

    // ---------------------------------------------------------
    // 2. MOVE AMBULANCE
    // ---------------------------------------------------------

    const ambulance = {
      ...state.ambulance,
      speed: ambulanceSpeed,
      position: {
        ...state.ambulance.position,
        x:
          state.ambulance.position.x +
          ambulanceSpeed * deltaTime,
      },
    };

    // ---------------------------------------------------------
    // 3. MOVE NORMAL TRAFFIC
    // ---------------------------------------------------------

    let vehicles = state.vehicles.map((vehicle) => ({
      ...vehicle,
      position: {
        ...vehicle.position,
        x:
          vehicle.position.x +
          vehicle.speed * deltaTime,
      },
    }));

    let notifications = [...state.notifications];

    // ---------------------------------------------------------
    // 4. CLEARWAY AI
    // ---------------------------------------------------------

    let nextDTEC = null;

    if (state.mode === "CLEARWAY") {
      const aiOutput = runAITick({
        ambulance,
        vehicles,
        currentDTEC: state.dtec,
        time: nextTime,
      });

      vehicles = vehicles.map((vehicle) => {
        const decision = aiOutput.decisions.find(
          (item) =>
            item.vehicleId === vehicle.id
        );

        if (!decision) {
          return vehicle;
        }

        // Already cleared vehicles stay cleared.
        if (vehicle.status === "CLEARED") {
          return {
            ...vehicle,
            selected: false,
          };
        }

        if (decision.selected) {
          return {
            ...vehicle,
            conflictScore:
              decision.conflictScore,
            selected: true,
            guided: true,
            status:
              vehicle.status === "NORMAL"
                ? "GUIDED"
                : vehicle.status,
          };
        }

        return {
          ...vehicle,
          conflictScore:
            decision.conflictScore,
          selected: false,
        };
      });

      // -------------------------------------------------------
      // 5. MOVE GUIDED VEHICLES ASIDE
      // -------------------------------------------------------

      vehicles = vehicles.map((vehicle) => {
        if (
          !vehicle.guided ||
          vehicle.status === "CLEARED"
        ) {
          return vehicle;
        }

        const targetY = getTargetY(vehicle.lane);
        const currentY = vehicle.position.y;

        const difference = targetY - currentY;

        if (Math.abs(difference) <= 2) {
          return {
            ...vehicle,
            position: {
              ...vehicle.position,
              y: targetY,
            },
            status: "CLEARED",
            selected: false,
            guided: true,
          };
        }

        const direction =
          difference > 0 ? 1 : -1;

        const newY =
          currentY +
          direction *
            LANE_SHIFT_SPEED *
            deltaTime;

        const reachedTarget =
          direction > 0
            ? newY >= targetY
            : newY <= targetY;

        if (reachedTarget) {
          return {
            ...vehicle,
            position: {
              ...vehicle.position,
              y: targetY,
            },
            status: "CLEARED",
            selected: false,
            guided: true,
          };
        }

        return {
          ...vehicle,
          position: {
            ...vehicle.position,
            y: newY,
          },
          status: "MOVING_ASIDE",
          guided: true,
        };
      });

      // -------------------------------------------------------
      // 6. CREATE GUIDANCE NOTIFICATIONS
      // -------------------------------------------------------

      for (const vehicle of vehicles) {
        const alreadyNotified =
          notifications.some(
            (notification) =>
              notification.vehicleId ===
              vehicle.id
          );

        if (
          vehicle.guided &&
          !alreadyNotified
        ) {
          notifications.push({
            id: `NOTIF-${vehicle.id}`,
            vehicleId: vehicle.id,
            type: "EMERGENCY_GUIDANCE",
            message:
              "Emergency corridor active. Move aside.",
            timestamp: Date.now(),
          });
        }
      }

      // -------------------------------------------------------
      // 7. UPDATE DTEC
      // -------------------------------------------------------

      const activeVehicles = vehicles.filter(
        (vehicle) =>
          vehicle.guided &&
          vehicle.status !== "CLEARED"
      );

      if (activeVehicles.length > 0) {
        nextDTEC = {
          id: "DTEC-01",
          status: "ACTIVE",
          center: {
            x: ambulance.position.x + 100,
            y: ambulance.position.y,
          },
          length: 220,
          width: 80,
          routeSegment:
            ambulance.predictedRoute.slice(0, 4),
          vehicleIds: activeVehicles.map(
            (vehicle) => vehicle.id
          ),
        };
      } else {
        nextDTEC = null;
      }
    }

    // ---------------------------------------------------------
    // 8. AMBULANCE STATUS
    // ---------------------------------------------------------

    let ambulanceStatus = ambulance.status;

    if (ambulance.position.x >= END_X) {
      ambulanceStatus = "COMPLETED";
    } else if (
      ambulance.position.x > 500
    ) {
      ambulanceStatus = "MOVING";
    } else {
      ambulanceStatus = "MOVING";
    }

    const finalAmbulance = {
      ...ambulance,
      status: ambulanceStatus,
    };

    // ---------------------------------------------------------
    // 9. COMPLETE SIMULATION
    // ---------------------------------------------------------

    if (
      finalAmbulance.status === "COMPLETED"
    ) {
      updateSimulationState({
        time: nextTime,
        ambulance: finalAmbulance,
        vehicles,
        dtec: null,
        notifications,
        status: "COMPLETED",
      });

      stopSimulationLoop();
      return;
    }

    // ---------------------------------------------------------
    // 10. UPDATE STATE
    // ---------------------------------------------------------

    let nextStatus = state.status;

    if (state.mode === "CLEARWAY") {
      const hasActiveDTEC =
        nextDTEC !== null;

      if (hasActiveDTEC) {
        nextStatus = "DTEC_ACTIVE";
      } else if (
        finalAmbulance.position.x > 400
      ) {
        nextStatus = "AMBULANCE_PASSING";
      } else {
        nextStatus = "RUNNING";
      }
    } else {
      if (
        finalAmbulance.position.x > 400
      ) {
        nextStatus = "AMBULANCE_PASSING";
      } else {
        nextStatus = "RUNNING";
      }
    }

    updateSimulationState({
      time: nextTime,
      status: nextStatus,
      ambulance: finalAmbulance,
      vehicles,
      dtec: nextDTEC,
      notifications,
    });
  }, TICK_MS);
}

export function stopSimulationLoop(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}