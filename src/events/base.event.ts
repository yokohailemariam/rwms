import { randomUUID } from 'crypto';

export interface EventEnvelope<T = any> {
  eventId: string;
  eventType: string;
  eventVersion: number;
  aggregateId: string;
  aggregateType: string;
  tenantId: string | null;
  correlationId?: string;
  occurredAt: string;
  payload: T;
}

export function createEvent<T>(
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  tenantId: string | null,
  payload: T,
  correlationId?: string,
): EventEnvelope<T> {
  return {
    eventId: randomUUID(),
    eventType,
    eventVersion: 1,
    aggregateId,
    aggregateType,
    tenantId,
    correlationId,
    occurredAt: new Date().toISOString(),
    payload,
  };
}
