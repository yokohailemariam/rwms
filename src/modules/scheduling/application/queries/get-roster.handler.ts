import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRosterQuery } from './get-roster.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@QueryHandler(GetRosterQuery)
export class GetRosterHandler implements IQueryHandler<GetRosterQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRosterQuery) {
    const assignments = await this.prisma.shiftAssignment.findMany({
      where: {
        tenantId: query.tenantId,
        factoryId: query.factoryId,
        date: { gte: query.startDate, lte: query.endDate },
      },
      include: {
        worker: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            departmentId: true,
          },
        },
        shift: {
          select: { id: true, name: true, startTime: true, endTime: true },
        },
      },
      orderBy: [{ date: 'asc' }, { worker: { lastName: 'asc' } }],
    });

    return {
      factoryId: query.factoryId,
      startDate: query.startDate,
      endDate: query.endDate,
      assignments,
    };
  }
}
