import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListWorkersQuery } from './list-workers.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@QueryHandler(ListWorkersQuery)
export class ListWorkersHandler implements IQueryHandler<ListWorkersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListWorkersQuery) {
    const where: any = { tenantId: query.tenantId };
    if (query.factoryId) where.factoryId = query.factoryId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { employeeId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.worker.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          factory: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
      }),
      this.prisma.worker.count({ where }),
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
