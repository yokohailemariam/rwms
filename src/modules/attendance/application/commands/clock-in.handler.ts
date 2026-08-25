import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClockInCommand } from './clock-in.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { DuplicateDetectionService } from '../../domain/duplicate-detection.service';

@CommandHandler(ClockInCommand)
export class ClockInHandler implements ICommandHandler<ClockInCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly duplicateDetection: DuplicateDetectionService,
  ) {}

  async execute(command: ClockInCommand) {
    const worker = await this.prisma.worker.findFirst({
      where: {
        id: command.workerId,
        tenantId: command.tenantId,
        status: 'ACTIVE',
      },
    });
    if (!worker) throw new NotFoundException('Active worker not found');

    const isDuplicate = await this.duplicateDetection.isDuplicateClockIn(
      command.tenantId,
      command.workerId,
      command.timestamp,
    );
    if (isDuplicate)
      throw new BadRequestException('Duplicate clock-in detected');

    const hasOpen = await this.duplicateDetection.hasOpenRecord(
      command.tenantId,
      command.workerId,
    );
    if (hasOpen) throw new BadRequestException('Worker already clocked in');

    // Map source to valid ClockInMethod enum value
    const methodMap: Record<string, string> = {
      NFC: 'NFC',
      KIOSK: 'NFC',
      MOBILE: 'QR',
      MANUAL: 'MANUAL',
      QR: 'QR',
    };
    const clockInMethod = methodMap[command.source] ?? 'MANUAL';

    const data: any = {
      tenantId: command.tenantId,
      workerId: command.workerId,
      factoryId: command.factoryId,
      shiftId: command.shiftId,
      clockInTime: command.timestamp,
      clockInMethod,
      status: 'ACTIVE',
    };

    if (command.kioskDeviceId) data.kioskId = command.kioskDeviceId;
    if (command.latitude !== undefined && command.longitude !== undefined) {
      data.coordinates = { lat: command.latitude, lng: command.longitude };
    }

    return this.prisma.attendanceRecord.create({ data });
  }
}
