import { Point } from "./vehicle";

export type DTECStatus = "ACTIVE" | "RELEASED";

export interface DTEC {
  id: string;
  status: DTECStatus;

  center: Point;
  length: number;
  width: number;

  routeSegment: Point[];
  vehicleIds: string[];
}