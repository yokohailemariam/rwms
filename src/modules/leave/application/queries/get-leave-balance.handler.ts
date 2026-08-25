import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLeaveBalanceQuery } from './get-leave-balance.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { Prisma } from '../../../../infrastructure/database/generated/prisma/client';

@QueryHandler(GetLeaveBalanceQuery)
export class GetLeaveBalanceHandler implements IQueryHandler<GetLeaveBalanceQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLeaveBalanceQuery) {
    const where: Prisma.LeaveBalanceWhereInput = {
      tenantId: query.tenantId,
      workerId: query.workerId,
    };
    if (query.year) where.year = query.year;

    return this.prisma.leaveBalance.findMany({
      where,
      include: {
        leaveType: {
          select: { id: true, name: true, code: true, isPaid: true },
        },
      },
      orderBy: { leaveType: { name: 'asc' } },
    });
  }
}
