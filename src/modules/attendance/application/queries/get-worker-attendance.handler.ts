import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetWorkerAttendanceQuery } from './get-worker-attendance.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@QueryHandler(GetWorkerAttendanceQuery)
export class GetWorkerAttendanceHandler implements IQueryHandler<GetWorkerAttendanceQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWorkerAttendanceQuery) {
    const where = {
      tenantId: query.tenantId,
      workerId: query.workerId,
      clockInTime: { gte: query.startDate, lte: query.endDate },
    };

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { clockInTime: 'desc' },
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    const totalHours = items.reduce(
      (sum, r) => sum + Number(r.hoursWorked ?? 0),
      0,
    );
    const overtimeHours = items.reduce(
      (sum, r) => sum + Number(r.overtimeHours ?? 0),
      0,
    );

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
      summary: {
        totalHours: totalHours.toFixed(1),
        overtimeHours: overtimeHours.toFixed(1),
      },
    };
  }
}
