import { ICommand } from '@nestjs/cqrs';

export class GeneratePayrollCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly periodId: string,
    public readonly triggeredBy: string,
  ) {}
}
