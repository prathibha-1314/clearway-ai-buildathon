import { runAITick } from "../engine/aiEngine";
import {
  getSimulationState,
  setResults,
  updateSimulationState,
} from "./simulationStore";

const TICK_MS = 100;
const AMBULANCE_LANE_Y = 280;
const AMBULANCE_SPEED = 42;
const BLOCKING_DISTANCE = 35;
const LANE_SHIFT_SPEED = 80;
const END_X = 580;

const FREE_FLOW_TIME =
  (END_X - 80) / AMBULANCE_SPEED;

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
  vehicles: NonNullable<
    ReturnType<typeof getSimulationState>
  >["vehicles"]
) {
  return vehicles
    .filter((vehicle) => {
      const sameLane =
        Math.abs(
          vehicle.position.y -
            AMBULANCE_LANE_Y
        ) < 8;

      const ahead =
        vehicle.position.x >
        ambulanceX;

      const notCleared =
        vehicle.status !== "CLEARED";

      const notMovingAside =
        vehicle.status !==
          "MOVING_ASIDE" &&
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

function calculateResults(
  sessionId: string,
  mode: "BASELINE" | "CLEARWAY",
  time: number,
  conflictingVehicleIds: Set<string>,
  selectedVehicleIds: Set<string>,
  guidedVehicleIds: Set<string>,
  clearanceTime: number
) {
  const ambulancePassageDelay =
    Math.max(
      0,
      Number(
        (time - FREE_FLOW_TIME).toFixed(
          2
        )
      )
    );

  return {
    sessionId,
    mode,

    ambulancePassageDelay,

    clearanceTime:
      mode === "CLEARWAY"
        ? Number(clearanceTime.toFixed(2))
        : 0,

    conflictingVehicles:
      conflictingVehicleIds.size,

    selectedVehicles:
      selectedVehicleIds.size,

    guidedVehicles:
      guidedVehicleIds.size,

    unnecessaryAlerts: 0,

    passageDelayDifference: 0,
    improvementPercent: 0,
  };
}

export function startSimulationLoop(): void {
  if (interval) {
    return;
  }

  const conflictingVehicleIds =
    new Set<string>();

  const selectedVehicleIds =
    new Set<string>();

  const guidedVehicleIds =
    new Set<string>();

  let clearanceTime: number | null =
    null;

  let guidanceStarted = false;

  interval = setInterval(() => {
    const state = getSimulationState();

    if (
      !state ||
      state.status === "COMPLETED"
    ) {
      stopSimulationLoop();
      return;
    }

    const deltaTime = TICK_MS / 1000;

    const nextTime =
      state.time + deltaTime;

    let ambulanceSpeed =
      AMBULANCE_SPEED;

    if (state.mode === "BASELINE") {
      const blocker =
        findBlockingVehicle(
          state.ambulance.position.x,
          state.vehicles
        );

      if (blocker) {
        const gap =
          blocker.position.x -
          state.ambulance.position.x;

        if (
          gap <= BLOCKING_DISTANCE
        ) {
          ambulanceSpeed =
            Math.min(
              AMBULANCE_SPEED,
              blocker.speed
            );
        }
      }
    }

    const ambulance = {
      ...state.ambulance,

      speed: ambulanceSpeed,

      position: {
        ...state.ambulance.position,

        x:
          state.ambulance.position.x +
          ambulanceSpeed *
            deltaTime,
      },
    };

    let vehicles =
      state.vehicles.map(
        (vehicle) => ({
          ...vehicle,

          position: {
            ...vehicle.position,

            x:
              vehicle.position.x +
              vehicle.speed *
                deltaTime,
          },
        })
      );

    let notifications = [
      ...state.notifications,
    ];

    let nextDTEC = null;

    if (state.mode === "CLEARWAY") {
      const aiOutput = runAITick({
        ambulance,
        vehicles,
        currentDTEC: state.dtec,
        time: nextTime,
      });

      for (const decision of aiOutput.decisions) {
        if (
          decision.conflictScore >= 0.65
        ) {
          conflictingVehicleIds.add(
            decision.vehicleId
          );
        }

        if (decision.selected) {
          selectedVehicleIds.add(
            decision.vehicleId
          );
        }
      }

      vehicles = vehicles.map(
        (vehicle) => {
          const decision =
            aiOutput.decisions.find(
              (item) =>
                item.vehicleId ===
                vehicle.id
            );

          if (!decision) {
            return vehicle;
          }

          if (
            vehicle.status ===
            "CLEARED"
          ) {
            return {
              ...vehicle,
              selected: false,
            };
          }

          if (decision.selected) {
            guidanceStarted = true;

            guidedVehicleIds.add(
              vehicle.id
            );

            return {
              ...vehicle,

              conflictScore:
                decision.conflictScore,

              selected: true,
              guided: true,

              status:
                vehicle.status ===
                "NORMAL"
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
        }
      );

      vehicles = vehicles.map(
        (vehicle) => {
          if (
            !vehicle.guided ||
            vehicle.status ===
              "CLEARED"
          ) {
            return vehicle;
          }

          const targetY =
            getTargetY(vehicle.lane);

          const currentY =
            vehicle.position.y;

          const difference =
            targetY - currentY;

          if (
            Math.abs(difference) <= 2
          ) {
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
        }
      );

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

            type:
              "EMERGENCY_GUIDANCE",

            message:
              "Emergency corridor active. Move aside.",

            timestamp: Date.now(),
          });
        }
      }

      const activeVehicles =
        vehicles.filter(
          (vehicle) =>
            vehicle.guided &&
            vehicle.status !==
              "CLEARED"
        );

      if (
        guidanceStarted &&
        activeVehicles.length === 0 &&
        clearanceTime === null
      ) {
        clearanceTime = nextTime;
      }

      if (
        activeVehicles.length > 0
      ) {
        nextDTEC = {
          id: "DTEC-01",

          status: "ACTIVE",

          center: {
            x:
              ambulance.position.x +
              100,
            y:
              ambulance.position.y,
          },

          length: 220,
          width: 80,

          routeSegment:
            ambulance.predictedRoute.slice(
              0,
              4
            ),

          vehicleIds:
            activeVehicles.map(
              (vehicle) =>
                vehicle.id
            ),
        };
      }
    }

    const ambulanceCompleted =
      ambulance.position.x >= END_X;

    const finalAmbulance = {
      ...ambulance,

      status: ambulanceCompleted
        ? ("COMPLETED" as const)
        : ("MOVING" as const),
    };

    if (ambulanceCompleted) {
      const results =
        calculateResults(
          state.sessionId,
          state.mode,
          nextTime,
          conflictingVehicleIds,
          selectedVehicleIds,
          guidedVehicleIds,
          clearanceTime ?? 0
        );

      updateSimulationState({
        time: nextTime,

        ambulance:
          finalAmbulance,

        vehicles,

        dtec: null,

        notifications,

        status: "COMPLETED",
      });

      setResults(results);

      stopSimulationLoop();

      return;
    }

    let nextStatus =
      state.status;

    if (
      state.mode === "CLEARWAY"
    ) {
      if (nextDTEC) {
        nextStatus =
          "DTEC_ACTIVE";
      } else if (
        finalAmbulance.position.x >
        400
      ) {
        nextStatus =
          "AMBULANCE_PASSING";
      } else {
        nextStatus = "RUNNING";
      }
    } else {
      if (
        finalAmbulance.position.x >
        400
      ) {
        nextStatus =
          "AMBULANCE_PASSING";
      } else {
        nextStatus = "RUNNING";
      }
    }

    updateSimulationState({
      time: nextTime,

      status: nextStatus,

      ambulance:
        finalAmbulance,

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