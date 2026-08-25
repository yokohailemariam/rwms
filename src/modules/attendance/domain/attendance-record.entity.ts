export class AttendanceRecordEntity {
  id: string;
  tenantId: string;
  workerId: string;
  factoryId: string;
  shiftId?: string;
  clockInTime: Date;
  clockOutTime?: Date;
  clockInSource: string;
  clockOutSource?: string;
  clockInLatitude?: number;
  clockInLongitude?: number;
  clockOutLatitude?: number;
  clockOutLongitude?: number;
  status: string;
  totalMinutes?: number;
  overtimeMinutes?: number;
  notes?: string;

  get durationMinutes(): number | null {
    if (!this.clockOutTime) return null;
    return Math.floor(
      (this.clockOutTime.getTime() - this.clockInTime.getTime()) / 60000,
    );
  }

  isClockedOut(): boolean {
    return !!this.clockOutTime;
  }

  isLate(shiftStartTime: Date): boolean {
    const gracePeriodMs = 5 * 60 * 1000;
    return (
      this.clockInTime.getTime() > shiftStartTime.getTime() + gracePeriodMs
    );
  }
}
