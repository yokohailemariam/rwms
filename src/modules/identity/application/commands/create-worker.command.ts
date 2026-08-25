import { ICommand } from '@nestjs/cqrs';

export class CreateWorkerCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly factoryId: string,
    public readonly employeeId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly hireDate: Date,
    public readonly departmentId?: string,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly nfcCardId?: string,
    public readonly jobTitle?: string,
    public readonly salary?: number,
    public readonly currency?: string,
  ) {}
}
