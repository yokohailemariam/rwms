import { ICommand } from '@nestjs/cqrs';

export class CorrectAttendanceCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly recordId: string,
    public readonly correctedBy: string,
    public readonly clockInTime?: Date,
    public readonly clockOutTime?: Date,
    public readonly notes?: string,
  ) {}
}
