import { IQuery } from '@nestjs/cqrs';

export class ListIncidentsQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly factoryId?: string,
    public readonly status?: string,
    public readonly severity?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
