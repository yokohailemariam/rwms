import { ICommand } from '@nestjs/cqrs';

export class CreateTenantCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly ownerEmail: string,
    public readonly ownerFirstName: string,
    public readonly ownerLastName: string,
    public readonly planTier: string = 'STARTER',
  ) {}
}
