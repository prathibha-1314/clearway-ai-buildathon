export interface Notification {
  id: string;
  vehicleId: string;
  type: "EMERGENCY_GUIDANCE";
  message: string;
  timestamp: number;
}