import { ICommand } from '@nestjs/cqrs';

export class ClockOutCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
    public readonly source: string,
    public readonly timestamp: Date,
    public readonly latitude?: number,
    public readonly longitude?: number,
    public readonly kioskDeviceId?: string,
  ) {}
}
