import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SyncBatchCommand, SyncRecord } from './sync-batch.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(SyncBatchCommand)
export class SyncBatchHandler implements ICommandHandler<SyncBatchCommand> {
  private readonly logger = new Logger(SyncBatchHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SyncBatchCommand) {
    const results: Array<{ localId: string; status: string; error?: string }> =
      [];

    for (const record of command.records) {
      try {
        await this.processRecord(
          record,
          command.tenantId,
          command.factoryId,
          command.deviceId,
        );
        results.push({ localId: record.localId, status: 'SUCCESS' });
      } catch (err: any) {
        this.logger.warn(
          `Sync record failed: ${record.localId} - ${err.message}`,
        );
        results.push({
          localId: record.localId,
          status: 'FAILED',
          error: err.message,
        });
      }
    }

    await this.prisma.kioskDevice.update({
      where: { id: command.deviceId },
      data: { lastSyncAt: new Date(), lastHeartbeatAt: new Date() },
    });

    const successCount = results.filter((r) => r.status === 'SUCCESS').length;
    return {
      batchId: command.batchId,
      total: command.records.length,
      successCount,
      results,
    };
  }

  private async processRecord(
    record: SyncRecord,
    tenantId: string,
    factoryId: string,
    deviceId: string,
  ) {
    let workerId = record.workerId;
    if (!workerId && record.nfcCardId) {
      const worker = await this.prisma.worker.findFirst({
        where: { tenantId, nfcCardId: record.nfcCardId },
      });
      if (!worker)
        throw new Error(`No worker found for NFC card: ${record.nfcCardId}`);
      workerId = worker.id;
    }
    if (!workerId) throw new Error('workerId or nfcCardId required');

    const timestamp = new Date(record.timestamp);
    if (record.type === 'CLOCK_IN') {
      await this.prisma.attendanceRecord.create({
        data: {
          tenantId,
          workerId,
          factoryId,
          clockInTime: timestamp,
          clockInMethod: 'NFC',
          kioskId: deviceId,
          status: 'ACTIVE',
          syncedFromKiosk: true,
        },
      });
    } else {
      const open = await this.prisma.attendanceRecord.findFirst({
        where: { tenantId, workerId, clockOutTime: null, status: 'ACTIVE' },
      });
      if (open) {
        const totalMs = timestamp.getTime() - open.clockInTime.getTime();
        const hoursWorked = Number((totalMs / (1000 * 60 * 60)).toFixed(2));
        const overtimeHours = Math.max(0, hoursWorked - 8);
        await this.prisma.attendanceRecord.update({
          where: { id: open.id },
          data: {
            clockOutTime: timestamp,
            clockOutMethod: 'NFC',
            hoursWorked,
            overtimeHours,
            syncedFromKiosk: true,
          },
        });
      }
    }
  }
}
