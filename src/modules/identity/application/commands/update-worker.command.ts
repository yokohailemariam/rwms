import { ICommand } from '@nestjs/cqrs';

export class UpdateWorkerCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workerId: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly departmentId?: string,
    public readonly nfcCardId?: string,
    public readonly jobTitle?: string,
    public readonly salary?: number,
    public readonly currency?: string,
  ) {}
}
