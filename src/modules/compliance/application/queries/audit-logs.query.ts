import { IQuery } from '@nestjs/cqrs';

export class AuditLogsQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId?: string,
    public readonly action?: string,
    public readonly resource?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}
