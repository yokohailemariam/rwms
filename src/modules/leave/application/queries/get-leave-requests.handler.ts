import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLeaveRequestsQuery } from './get-leave-requests.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@QueryHandler(GetLeaveRequestsQuery)
export class GetLeaveRequestsHandler implements IQueryHandler<GetLeaveRequestsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLeaveRequestsQuery) {
    const where: any = { tenantId: query.tenantId };
    if (query.workerId) where.workerId = query.workerId;
    if (query.status) where.status = query.status;

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          leaveType: { select: { id: true, name: true, code: true } },
          worker: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
