import { IQuery } from '@nestjs/cqrs';

export class GetRosterQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly factoryId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly departmentId?: string,
  ) {}
}
