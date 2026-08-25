import { ICommand } from '@nestjs/cqrs';

export class SubmitLeaveCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
    public readonly leaveTypeId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly daysRequested: number,
    public readonly reason?: string,
  ) {}
}
