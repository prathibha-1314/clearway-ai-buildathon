import { Router } from "express";
import { getResultsBySession } from "../controllers/resultsController";

const router = Router();

router.get(
  "/:sessionId",
  getResultsBySession
);

export default router;