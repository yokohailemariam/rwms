import { ICommand } from '@nestjs/cqrs';

export class CreatePayrollPeriodCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly factoryId: string,
    public readonly name: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly paymentDate?: Date,
    public readonly currency: string = 'USD',
  ) {}
}
