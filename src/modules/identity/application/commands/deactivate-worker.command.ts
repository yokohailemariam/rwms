import { ICommand } from '@nestjs/cqrs';

export class DeactivateWorkerCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
    public readonly status: 'INACTIVE' | 'SUSPENDED' | 'TERMINATED',
    public readonly reason?: string,
  ) {}
}
