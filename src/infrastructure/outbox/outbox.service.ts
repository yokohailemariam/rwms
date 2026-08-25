import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async publish(
    tenantId: string | null,
    eventType: string,
    aggregateId: string,
    aggregateType: string,
    payload: Record<string, any>,
  ): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: {
        eventType,
        aggregateId,
        aggregateType,
        tenantId: tenantId || undefined,
        payload,
        status: 'PENDING',
        attempts: 0,
      },
    });
  }
}
