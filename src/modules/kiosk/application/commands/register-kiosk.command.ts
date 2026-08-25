import { ICommand } from '@nestjs/cqrs';

export class RegisterKioskCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly factoryId: string,
    public readonly serialNumber: string,
    public readonly name: string,
    public readonly location?: string,
    public readonly firmwareVersion?: string,
  ) {}
}
