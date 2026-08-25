import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListIncidentsQuery } from './list-incidents.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  IncidentStatus,
  Prisma,
  Severity,
} from '../../../../infrastructure/database/generated/prisma/client';

@QueryHandler(ListIncidentsQuery)
export class ListIncidentsHandler implements IQueryHandler<ListIncidentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListIncidentsQuery) {
    const where: Prisma.EmergencyIncidentWhereInput = {
      tenantId: query.tenantId,
    };
    if (query.factoryId) where.factoryId = query.factoryId;
    if (query.status) where.status = query.status as IncidentStatus;
    if (query.severity) where.severity = query.severity as Severity;

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.emergencyIncident.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.emergencyIncident.count({ where }),
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
