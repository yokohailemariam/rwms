import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WorkforceKpisQuery } from './workforce-kpis.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { Prisma } from '../../../../infrastructure/database/generated/prisma/client';

@QueryHandler(WorkforceKpisQuery)
export class WorkforceKpisHandler implements IQueryHandler<WorkforceKpisQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: WorkforceKpisQuery) {
    const workerWhere: Prisma.WorkerWhereInput = { tenantId: query.tenantId };
    if (query.factoryId) workerWhere.factoryId = query.factoryId;

    const attendanceWhere: Prisma.AttendanceRecordWhereInput = {
      tenantId: query.tenantId,
    };
    if (query.factoryId) attendanceWhere.factoryId = query.factoryId;
    if (query.startDate || query.endDate) {
      const clockInTimeFilter: Prisma.DateTimeFilter = {};
      if (query.startDate) clockInTimeFilter.gte = query.startDate;
      if (query.endDate) clockInTimeFilter.lte = query.endDate;
      attendanceWhere.clockInTime = clockInTimeFilter;
    }

    const [
      totalWorkers,
      activeWorkers,
      totalAttendance,
      pendingLeave,
      openIncidents,
    ] = await Promise.all([
      this.prisma.worker.count({ where: workerWhere }),
      this.prisma.worker.count({ where: { ...workerWhere, status: 'ACTIVE' } }),
      this.prisma.attendanceRecord.aggregate({
        where: attendanceWhere,
        _sum: { hoursWorked: true, overtimeHours: true },
        _count: { id: true },
      }),
      this.prisma.leaveRequest.count({
        where: { tenantId: query.tenantId, status: 'PENDING' },
      }),
      this.prisma.emergencyIncident.count({
        where: { tenantId: query.tenantId, status: 'OPEN' },
      }),
    ]);

    return {
      workforce: {
        total: totalWorkers,
        active: activeWorkers,
        inactive: totalWorkers - activeWorkers,
      },
      attendance: {
        totalRecords: totalAttendance._count.id,
        totalHours: Number(totalAttendance._sum.hoursWorked ?? 0).toFixed(1),
        overtimeHours: Number(totalAttendance._sum.overtimeHours ?? 0).toFixed(
          1,
        ),
      },
      leave: { pendingRequests: pendingLeave },
      emergency: { openIncidents },
    };
  }
}
