import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDailyAttendanceQuery } from './get-daily-attendance.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@QueryHandler(GetDailyAttendanceQuery)
export class GetDailyAttendanceHandler implements IQueryHandler<GetDailyAttendanceQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDailyAttendanceQuery) {
    const dayStart = new Date(query.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(query.date);
    dayEnd.setHours(23, 59, 59, 999);

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        tenantId: query.tenantId,
        factoryId: query.factoryId,
        clockInTime: { gte: dayStart, lte: dayEnd },
      },
      include: {
        worker: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { clockInTime: 'asc' },
    });

    const present = records.length;
    const completed = records.filter((r) => r.clockOutTime !== null).length;
    const stillIn = records.filter((r) => r.clockOutTime === null).length;

    return {
      date: query.date,
      factoryId: query.factoryId,
      records,
      summary: { present, completed, stillIn },
    };
  }
}
