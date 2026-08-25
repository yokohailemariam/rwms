import { ICommand } from '@nestjs/cqrs';

export class AnonymizeWorkerCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
    public readonly requestedBy: string,
    public readonly reason: string,
  ) {}
}
