import { Request, Response } from "express";
import { getResults } from "../services/simulationStore";

export function getResultsBySession(
  req: Request,
  res: Response
) {
  const { sessionId } = req.params;

  const results = getResults(sessionId);

  if (!results) {
    return res.status(404).json({
      success: false,
      error: {
        code: "RESULTS_NOT_FOUND",
        message:
          "Simulation results not found",
      },
    });
  }

  return res.json({
    success: true,
    results,
  });
}