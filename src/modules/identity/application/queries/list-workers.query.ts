import { IQuery } from '@nestjs/cqrs';

export class ListWorkersQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly factoryId?: string,
    public readonly departmentId?: string,
    public readonly status?: string,
    public readonly search?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
