import { IQuery } from '@nestjs/cqrs';

export class GetLeaveBalanceQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
    public readonly year?: number,
  ) {}
}
