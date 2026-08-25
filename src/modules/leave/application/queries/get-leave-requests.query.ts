import { IQuery } from '@nestjs/cqrs';

export class GetLeaveRequestsQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly workerId?: string,
    public readonly status?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
