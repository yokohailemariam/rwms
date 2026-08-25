import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { KafkaProducer } from '../kafka/kafka.producer';
import { RedisService } from '../redis/redis.service';

const OUTBOX_LOCK_KEY = 'outbox:processor:lock';
const OUTBOX_LOCK_TTL = 30; // seconds
const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 5;

@Injectable()
export class OutboxProcessor implements OnModuleInit {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaProducer: KafkaProducer,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Initial processing on startup
    await this.processOutboxEvents();
  }

  @Cron('*/5 * * * * *')
  async processOutboxEvents(): Promise<void> {
    // Distributed lock to prevent duplicate processing
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      return;
    }

    try {
      const events = await this.prisma.outboxEvent.findMany({
        where: {
          status: 'PENDING',
          attempts: { lt: MAX_ATTEMPTS },
        },
        take: BATCH_SIZE,
        orderBy: { createdAt: 'asc' },
      });

      if (!events) return;

      if (events.length === 0) {
        return;
      }

      // Mark as PROCESSING
      const eventIds = events.map((e) => e.id);
      await this.prisma.outboxEvent.updateMany({
        where: { id: { in: eventIds } },
        data: { status: 'PROCESSING' },
      });

      for (const event of events) {
        try {
          await this.kafkaProducer.publish(
            event.eventType,
            event.aggregateId,
            event.payload,
            {
              eventType: event.eventType,
              aggregateType: event.aggregateType,
              ...(event.tenantId ? { tenantId: event.tenantId } : {}),
            },
          );

          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: 'PUBLISHED',
              publishedAt: new Date(),
              attempts: event.attempts + 1,
              lastAttemptAt: new Date(),
            },
          });
        } catch (error) {
          this.logger.error(
            `Failed to publish outbox event ${event.id}: ${error.message}`,
          );
          const newAttempts = event.attempts + 1;
          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: newAttempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING',
              attempts: newAttempts,
              lastAttemptAt: new Date(),
            },
          });
        }
      }
    } catch (error) {
      this.logger.error(`Outbox processor error: ${error.message}`);
    } finally {
      await this.releaseLock();
    }
  }

  private async acquireLock(): Promise<boolean> {
    try {
      const result = await this.redis.setnx(OUTBOX_LOCK_KEY, '1');
      if (result === 1) {
        await this.redis.expire(OUTBOX_LOCK_KEY, OUTBOX_LOCK_TTL);
        return true;
      }
      return false;
    } catch {
      return true; // Allow processing if Redis is unavailable
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      await this.redis.del(OUTBOX_LOCK_KEY);
    } catch {
      // ignore
    }
  }
}
