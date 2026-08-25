import { ICommand } from '@nestjs/cqrs';

export class AssignShiftCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
    public readonly shiftId: string,
    public readonly factoryId: string,
    public readonly date: Date,
    public readonly assignedBy: string,
  ) {}
}
