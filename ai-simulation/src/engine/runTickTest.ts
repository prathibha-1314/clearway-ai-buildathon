import { createHeavyCongestionScenario } from "../scenarios/heavyCongestion";
import { runSimulationTick } from "./simulationTick";

const scenario = createHeavyCongestionScenario();

console.log("\n=== SIMULATION TICK TEST ===\n");

console.log(
  `Initial ambulance position: (${scenario.ambulance.x}, ${scenario.ambulance.y})`,
);

const result = runSimulationTick(
  scenario.ambulance,
  scenario.vehicles,
  1,
);

console.log(
  `After 1 second: (${result.ambulance.x}, ${result.ambulance.y})`,
);

console.log(
  `DTEC: ${result.dtec ? result.dtec.id : "none"}`,
);

console.log(
  `Selected vehicles: ${
    result.vehicles.filter(
      (vehicle) => vehicle.selected,
    ).length
  }`,
);

console.log("\n=== END TICK TEST ===\n");
