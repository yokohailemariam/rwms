import { ICommand } from '@nestjs/cqrs';

export class ApproveKioskCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly deviceId: string,
    public readonly approvedBy: string,
  ) {}
}
