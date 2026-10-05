import { useEffect, useState } from "react";
import "./App.css";

import type {
  SimulationMode,
  SimulationState,
  Vehicle,
} from "./types/simulation";

type Screen = "intro" | "setup" | "simulation";

const demoVehicles: Vehicle[] = [
  {
    id: "V01",
    position: { x: 20, y: 18 },
    speed: 32,
    heading: 90,
    lane: 1,
    status: "NORMAL",
    conflictScore: 0.18,
    selected: false,
    guided: false,
    distanceToRoute: 42,
    routeOverlap: 0.12,
    headingMatch: 0.31,
    timeToConflict: 8.4,
  },
  {
    id: "V02",
    position: { x: 42, y: 28 },
    speed: 27,
    heading: 270,
    lane: 2,
    status: "NORMAL",
    conflictScore: 0.22,
    selected: false,
    guided: false,
    distanceToRoute: 36,
    routeOverlap: 0.18,
    headingMatch: 0.35,
    timeToConflict: 9.2,
  },
  {
    id: "V03",
    position: { x: 67, y: 20 },
    speed: 30,
    heading: 90,
    lane: 3,
    status: "NORMAL",
    conflictScore: 0.14,
    selected: false,
    guided: false,
    distanceToRoute: 51,
    routeOverlap: 0.09,
    headingMatch: 0.24,
    timeToConflict: 11.1,
  },
  {
    id: "V04",
    position: { x: 30, y: 45 },
    speed: 24,
    heading: 90,
    lane: 1,
    status: "NORMAL",
    conflictScore: 0.27,
    selected: false,
    guided: false,
    distanceToRoute: 31,
    routeOverlap: 0.21,
    headingMatch: 0.42,
    timeToConflict: 7.8,
  },
  {
    id: "V05",
    position: { x: 52, y: 52 },
    speed: 21,
    heading: 270,
    lane: 2,
    status: "NORMAL",
    conflictScore: 0.19,
    selected: false,
    guided: false,
    distanceToRoute: 39,
    routeOverlap: 0.15,
    headingMatch: 0.29,
    timeToConflict: 10.6,
  },
  {
    id: "V06",
    position: { x: 76, y: 43 },
    speed: 26,
    heading: 90,
    lane: 3,
    status: "NORMAL",
    conflictScore: 0.33,
    selected: false,
    guided: false,
    distanceToRoute: 28,
    routeOverlap: 0.27,
    headingMatch: 0.48,
    timeToConflict: 6.9,
  },
  {
    id: "V07",
    position: { x: 23, y: 66 },
    speed: 29,
    heading: 90,
    lane: 1,
    status: "NORMAL",
    conflictScore: 0.16,
    selected: false,
    guided: false,
    distanceToRoute: 47,
    routeOverlap: 0.11,
    headingMatch: 0.26,
    timeToConflict: 12.3,
  },
  {
    id: "V08",
    position: { x: 48, y: 72 },
    speed: 22,
    heading: 270,
    lane: 2,
    status: "NORMAL",
    conflictScore: 0.25,
    selected: false,
    guided: false,
    distanceToRoute: 34,
    routeOverlap: 0.2,
    headingMatch: 0.38,
    timeToConflict: 8.1,
  },
  {
    id: "V09",
    position: { x: 72, y: 64 },
    speed: 31,
    heading: 90,
    lane: 3,
    status: "NORMAL",
    conflictScore: 0.12,
    selected: false,
    guided: false,
    distanceToRoute: 55,
    routeOverlap: 0.08,
    headingMatch: 0.19,
    timeToConflict: 13.5,
  },
  {
    id: "V10",
    position: { x: 35, y: 82 },
    speed: 25,
    heading: 90,
    lane: 1,
    status: "NORMAL",
    conflictScore: 0.29,
    selected: false,
    guided: false,
    distanceToRoute: 29,
    routeOverlap: 0.24,
    headingMatch: 0.44,
    timeToConflict: 7.4,
  },
  {
    id: "V11",
    position: { x: 57, y: 14 },
    speed: 23,
    heading: 270,
    lane: 2,
    status: "NORMAL",
    conflictScore: 0.21,
    selected: false,
    guided: false,
    distanceToRoute: 37,
    routeOverlap: 0.17,
    headingMatch: 0.33,
    timeToConflict: 9.7,
  },
  {
    id: "V12",
    position: { x: 82, y: 76 },
    speed: 28,
    heading: 90,
    lane: 3,
    status: "NORMAL",
    conflictScore: 0.17,
    selected: false,
    guided: false,
    distanceToRoute: 44,
    routeOverlap: 0.13,
    headingMatch: 0.28,
    timeToConflict: 11.8,
  },
];

const demoSimulationState: SimulationState = {
  sessionId: "DEMO-001",
  mode: "BASELINE",
  status: "RUNNING",
  time: 0,
  ambulance: {
    id: "AMB-01",
    position: { x: 50, y: 92 },
    speed: 40,
    heading: 0,
    status: "MOVING",
    route: [
      { x: 50, y: 92 },
      { x: 50, y: 75 },
      { x: 50, y: 55 },
      { x: 50, y: 35 },
      { x: 50, y: 10 },
    ],
    predictedRoute: [
      { x: 50, y: 92 },
      { x: 50, y: 75 },
      { x: 50, y: 55 },
      { x: 50, y: 35 },
      { x: 50, y: 10 },
    ],
  },
  vehicles: demoVehicles,
  dtec: null,
  notifications: [],
  results: null,
};

function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [mode, setMode] = useState<SimulationMode>("BASELINE");
  const [ambulanceY, setAmbulanceY] = useState(92);

  useEffect(() => {
    if (screen !== "simulation") {
      return;
    }

    const interval = window.setInterval(() => {
      setAmbulanceY((currentY) => {
        if (currentY <= 8) {
          return 92;
        }

        return currentY - 1;
      });
    }, 120);

    return () => window.clearInterval(interval);
  }, [screen]);

  if (screen === "simulation") {
    return (
      <main className="app">
        <section className="simulation-screen">
          <header className="topbar">
            <div className="brand">
              <span className="brand-mark">+</span>
              <span>CLEARWAY AI</span>
            </div>

            <span className="buildathon">BUILDATHON 2026</span>
          </header>

          <div className="simulation-content">
            <div className="eyebrow">LIVE SIMULATION</div>

            <h1>
              {mode === "BASELINE"
                ? "Baseline Response"
                : "ClearWay Response"}
            </h1>

            <div className="simulation-status">
              <span className="status-dot"></span>
              SIMULATION RUNNING
            </div>

            <div className="simulation-placeholder">
              <div className="road-placeholder">
                <div className="lane lane-1"></div>
                <div className="lane lane-2"></div>
                <div className="lane lane-3"></div>

                {demoSimulationState.vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="vehicle"
                    style={{
                      left: `${vehicle.position.x}%`,
                      top: `${vehicle.position.y}%`,
                    }}
                    title={vehicle.id}
                  >
                    <span>{vehicle.id}</span>
                  </div>
                ))}

                <div
                  className="ambulance-placeholder"
                  style={{
                    left: "50%",
                    top: `${ambulanceY}%`,
                  }}
                >
                  +
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "setup") {
    return (
      <main className="app">
        <section className="setup-screen">
          <header className="topbar">
            <div className="brand">
              <span className="brand-mark">+</span>
              <span>CLEARWAY AI</span>
            </div>

            <span className="buildathon">BUILDATHON 2026</span>
          </header>

          <div className="setup-content">
            <div className="eyebrow">SIMULATION CONFIGURATION</div>

            <h1>Heavy Urban Congestion</h1>

            <p className="setup-description">
              Evaluate emergency response performance under a controlled,
              high-density traffic scenario.
            </p>

            <div className="setup-grid">
              <div className="setup-card">
                <span className="card-label">SCENARIO</span>
                <strong>Heavy Congestion</strong>
              </div>

              <div className="setup-card">
                <span className="card-label">TRAFFIC</span>
                <strong>20 Vehicles</strong>
              </div>

              <div className="setup-card">
                <span className="card-label">EMERGENCY UNIT</span>
                <strong>1 Ambulance</strong>
              </div>

              <div className="setup-card">
                <span className="card-label">SCENARIO SEED</span>
                <strong>BUILDATHON-001</strong>
              </div>
            </div>

            <div className="mode-section">
              <span className="card-label">RESPONSE MODE</span>

              <div className="mode-toggle">
                <button
                  className={`mode-button ${
                    mode === "BASELINE" ? "active" : ""
                  }`}
                  onClick={() => setMode("BASELINE")}
                >
                  BASELINE
                </button>

                <button
                  className={`mode-button ${
                    mode === "CLEARWAY" ? "active" : ""
                  }`}
                  onClick={() => setMode("CLEARWAY")}
                >
                  CLEARWAY
                </button>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                setAmbulanceY(92);
                setScreen("simulation");
              }}
            >
              START SIMULATION
              <span>→</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="intro-screen">
        <div className="intro-content">
          <div className="clearway-logo">
            <img src="/clearway-logo.jpeg" alt="ClearWay AI logo" />
          </div>

          <div className="eyebrow">
            EMERGENCY RESPONSE INTELLIGENCE
          </div>

          <h1>
            CLEARWAY
            <span>AI</span>
          </h1>

          <p>
            Intelligent traffic coordination for faster emergency response.
          </p>

          <div className="intro-meta">
            <span>BUILDATHON 2026</span>
            <span className="divider">/</span>
            <span>CONTROLLED SIMULATION</span>
          </div>

          <button
            className="primary-button intro-button"
            onClick={() => setScreen("setup")}
          >
            ENTER SIMULATION
            <span>→</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;