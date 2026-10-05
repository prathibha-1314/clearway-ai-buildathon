import { createHeavyCongestionScenario } from "../scenarios/heavyCongestion";
import { runAIPipeline } from "./aiPipeline";

const scenario = createHeavyCongestionScenario();

const result = runAIPipeline(
  scenario.ambulance,
  scenario.vehicles,
);

console.log("\n=== CLEARWAY AI PIPELINE TEST ===\n");

console.log("VEHICLE DECISIONS\n");

for (const vehicle of result.vehicles) {
  console.log(
    `${vehicle.id} | ` +
      `score=${vehicle.conflictScore} | ` +
      `status=${vehicle.status} | ` +
      `selected=${vehicle.selected} | ` +
      `guided=${vehicle.guided}`,
  );
}

console.log("\nDTEC\n");

if (result.dtec) {
  console.log(`ID: ${result.dtec.id}`);
  console.log(`Status: ${result.dtec.status}`);
  console.log(
    `Center: (${result.dtec.center.x}, ${result.dtec.center.y})`,
  );
  console.log(
    `Vehicles: ${result.dtec.vehicleIds.join(", ")}`,
  );
} else {
  console.log("No DTEC recommended.");
}

console.log("\nMETRICS\n");

console.log(
  `Passage delay: ${result.metrics.passageDelay}`,
);

console.log(
  `Clearance time: ${result.metrics.clearanceTime}`,
);

console.log(
  `Vehicles detected: ${result.metrics.vehiclesDetected}`,
);

console.log(
  `Vehicles selected: ${result.metrics.vehiclesSelected}`,
);

console.log(
  `Vehicles guided: ${result.metrics.vehiclesGuided}`,
);

console.log(
  `Unnecessary alerts: ${result.metrics.unnecessaryAlerts}`,
);

console.log("\n=== END TEST ===\n");
