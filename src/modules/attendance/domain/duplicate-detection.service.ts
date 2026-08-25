import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class DuplicateDetectionService {
  private readonly WINDOW_MINUTES = 10;

  constructor(private readonly prisma: PrismaService) {}

  async isDuplicateClockIn(
    tenantId: string,
    workerId: string,
    timestamp: Date,
  ): Promise<boolean> {
    const windowStart = new Date(
      timestamp.getTime() - this.WINDOW_MINUTES * 60 * 1000,
    );
    const existing = await this.prisma.attendanceRecord.findFirst({
      where: {
        tenantId,
        workerId,
        clockInTime: { gte: windowStart, lte: timestamp },
      },
    });
    return !!existing;
  }

  async hasOpenRecord(tenantId: string, workerId: string): Promise<boolean> {
    const open = await this.prisma.attendanceRecord.findFirst({
      where: { tenantId, workerId, clockOutTime: null, status: 'ACTIVE' },
    });
    return !!open;
  }

  async getOpenRecord(tenantId: string, workerId: string) {
    return this.prisma.attendanceRecord.findFirst({
      where: { tenantId, workerId, clockOutTime: null, status: 'ACTIVE' },
    });
  }
}
