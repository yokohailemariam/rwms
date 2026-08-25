import { IQuery } from '@nestjs/cqrs';

export class GetDailyAttendanceQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly factoryId: string,
    public readonly date: Date,
  ) {}
}
