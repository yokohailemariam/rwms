import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetWorkerQuery } from './get-worker.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@QueryHandler(GetWorkerQuery)
export class GetWorkerHandler implements IQueryHandler<GetWorkerQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWorkerQuery) {
    const worker = await this.prisma.worker.findFirst({
      where: { id: query.workerId, tenantId: query.tenantId },
      include: {
        factory: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }
}
