import { IQuery } from '@nestjs/cqrs';

export class GetWorkerAttendanceQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly page: number = 1,
    public readonly limit: number = 30,
  ) {}
}
