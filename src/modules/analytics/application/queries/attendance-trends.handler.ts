import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AttendanceTrendsQuery } from './attendance-trends.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@QueryHandler(AttendanceTrendsQuery)
export class AttendanceTrendsHandler implements IQueryHandler<AttendanceTrendsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: AttendanceTrendsQuery) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        tenantId: query.tenantId,
        factoryId: query.factoryId,
        clockInTime: { gte: query.startDate, lte: query.endDate },
      },
      select: { clockInTime: true, hoursWorked: true, overtimeHours: true },
      orderBy: { clockInTime: 'asc' },
    });

    const grouped: Record<
      string,
      { date: string; count: number; totalHours: number; overtimeHours: number }
    > = {};

    for (const r of records) {
      const key = r.clockInTime.toISOString().split('T')[0];
      if (!grouped[key]) {
        grouped[key] = { date: key, count: 0, totalHours: 0, overtimeHours: 0 };
      }
      grouped[key].count++;
      grouped[key].totalHours += Number(r.hoursWorked ?? 0);
      grouped[key].overtimeHours += Number(r.overtimeHours ?? 0);
    }

    const trend = Object.values(grouped).map((d) => ({
      date: d.date,
      headcount: d.count,
      totalHours: d.totalHours.toFixed(1),
      overtimeHours: d.overtimeHours.toFixed(1),
    }));

    return {
      factoryId: query.factoryId,
      granularity: query.granularity,
      trend,
    };
  }
}
