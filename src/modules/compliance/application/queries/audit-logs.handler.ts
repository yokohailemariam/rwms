import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AuditLogsQuery } from './audit-logs.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@QueryHandler(AuditLogsQuery)
export class AuditLogsHandler implements IQueryHandler<AuditLogsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: AuditLogsQuery) {
    const where: any = { tenantId: query.tenantId };
    if (query.userId) where.actorId = query.userId;
    if (query.action)
      where.action = { contains: query.action, mode: 'insensitive' };
    if (query.resource)
      where.resourceType = { contains: query.resource, mode: 'insensitive' };
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = query.startDate;
      if (query.endDate) where.createdAt.lte = query.endDate;
    }

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
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
