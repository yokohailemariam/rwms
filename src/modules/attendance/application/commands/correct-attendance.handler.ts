import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CorrectAttendanceCommand } from './correct-attendance.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(CorrectAttendanceCommand)
export class CorrectAttendanceHandler implements ICommandHandler<CorrectAttendanceCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CorrectAttendanceCommand) {
    const record = await this.prisma.attendanceRecord.findFirst({
      where: { id: command.recordId, tenantId: command.tenantId },
    });
    if (!record) throw new NotFoundException('Attendance record not found');

    const newClockIn = command.clockInTime ?? record.clockInTime;
    const newClockOut = command.clockOutTime ?? record.clockOutTime;

    let hoursWorked = record.hoursWorked;
    let overtimeHours = record.overtimeHours;
    if (newClockOut) {
      const totalMs = newClockOut.getTime() - newClockIn.getTime();
      hoursWorked = Number((totalMs / (1000 * 60 * 60)).toFixed(2)) as any;
      overtimeHours = Math.max(0, Number(hoursWorked) - 8) as any;
    }

    return this.prisma.attendanceRecord.update({
      where: { id: command.recordId },
      data: {
        clockInTime: newClockIn,
        clockOutTime: newClockOut,
        hoursWorked,
        overtimeHours,
        status: 'CORRECTED',
        notes: command.notes,
        correctedById: command.correctedBy,
        correctedAt: new Date(),
      },
    });
  }
}
