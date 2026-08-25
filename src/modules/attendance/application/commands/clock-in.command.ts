import { ICommand } from '@nestjs/cqrs';

export class ClockInCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
    public readonly factoryId: string,
    public readonly source: string,
    public readonly timestamp: Date,
    public readonly shiftId?: string,
    public readonly latitude?: number,
    public readonly longitude?: number,
    public readonly kioskDeviceId?: string,
    public readonly nfcCardId?: string,
  ) {}
}
