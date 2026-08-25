import { ICommand } from '@nestjs/cqrs';

export class CreateShiftCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly factoryId: string,
    public readonly name: string,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly durationMinutes: number,
    public readonly overnightShift: boolean = false,
    public readonly color?: string,
  ) {}
}
