import { IQuery } from '@nestjs/cqrs';

export class GetKioskConfigQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly deviceId: string,
  ) {}
}
