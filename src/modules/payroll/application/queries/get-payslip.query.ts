import { IQuery } from '@nestjs/cqrs';

export class GetPayslipQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly payslipId: string,
  ) {}
}
