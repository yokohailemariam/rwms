import { Injectable } from '@nestjs/common';

@Injectable()
export class OvertimeService {
  private readonly STANDARD_SHIFT_MINUTES = 480; // 8 hours

  calculateOvertime(
    clockInTime: Date,
    clockOutTime: Date,
    shiftMinutes?: number,
  ): number {
    const totalMinutes = Math.floor(
      (clockOutTime.getTime() - clockInTime.getTime()) / 60000,
    );
    const standard = shiftMinutes ?? this.STANDARD_SHIFT_MINUTES;
    return Math.max(0, totalMinutes - standard);
  }

  calculateTotalMinutes(clockInTime: Date, clockOutTime: Date): number {
    return Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / 60000);
  }
}
