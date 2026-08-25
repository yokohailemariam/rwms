import { ICommand } from '@nestjs/cqrs';

export class RejectLeaveCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly reviewerId: string,
    public readonly notes?: string,
  ) {}
}
