import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { ClockOutCommand } from './clock-out.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { DuplicateDetectionService } from '../../domain/duplicate-detection.service';

@CommandHandler(ClockOutCommand)
export class ClockOutHandler implements ICommandHandler<ClockOutCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly duplicateDetection: DuplicateDetectionService,
  ) {}

  async execute(command: ClockOutCommand) {
    const openRecord = await this.duplicateDetection.getOpenRecord(
      command.tenantId,
      command.workerId,
    );
    if (!openRecord)
      throw new BadRequestException('No open clock-in record found');

    const totalMs =
      command.timestamp.getTime() - openRecord.clockInTime.getTime();
    const hoursWorked = Number((totalMs / (1000 * 60 * 60)).toFixed(2));
    const standardHours = 8;
    const overtimeHours = Math.max(
      0,
      Number((hoursWorked - standardHours).toFixed(2)),
    );

    const methodMap: Record<string, string> = {
      NFC: 'NFC',
      KIOSK: 'NFC',
      MOBILE: 'QR',
      MANUAL: 'MANUAL',
      QR: 'QR',
    };
    const clockOutMethod = methodMap[command.source] ?? 'MANUAL';

    const updateData: any = {
      clockOutTime: command.timestamp,
      clockOutMethod,
      hoursWorked,
      overtimeHours,
    };

    if (command.latitude !== undefined && command.longitude !== undefined) {
      updateData.coordinates = {
        lat: command.latitude,
        lng: command.longitude,
      };
    }

    return this.prisma.attendanceRecord.update({
      where: { id: openRecord.id },
      data: updateData,
    });
  }
}
