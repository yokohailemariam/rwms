export interface WorkerClockedInPayload {
  workerId: string;
  factoryId: string;
  attendanceRecordId: string;
  clockInTime: string;
  method: string;
  kioskId?: string;
  isLate: boolean;
  minutesLate?: number;
}

export interface WorkerClockedOutPayload {
  workerId: string;
  factoryId: string;
  attendanceRecordId: string;
  clockOutTime: string;
  method: string;
  hoursWorked: number;
  overtimeHours: number;
}

export const ATTENDANCE_EVENT_TYPES = {
  WORKER_CLOCKED_IN: 'attendance.clocked-in.v1',
  WORKER_CLOCKED_OUT: 'attendance.clocked-out.v1',
  ATTENDANCE_CORRECTED: 'attendance.corrected.v1',
  ATTENDANCE_VOIDED: 'attendance.voided.v1',
} as const;
