import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPayslipsQuery } from './list-payslips.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { Prisma } from '../../../../infrastructure/database/generated/prisma/client';

@QueryHandler(ListPayslipsQuery)
export class ListPayslipsHandler implements IQueryHandler<ListPayslipsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListPayslipsQuery) {
    const where: Prisma.PayslipWhereInput = { tenantId: query.tenantId };
    if (query.workerId) where.workerId = query.workerId;
    if (query.periodId) where.payrollPeriodId = query.periodId;

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.payslip.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          worker: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
            },
          },
          payrollPeriod: {
            select: { id: true, name: true, startDate: true, endDate: true },
          },
        },
      }),
      this.prisma.payslip.count({ where }),
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
