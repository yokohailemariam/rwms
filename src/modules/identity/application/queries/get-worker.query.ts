import { IQuery } from '@nestjs/cqrs';

export class GetWorkerQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
  ) {}
}
