import { ICommand } from '@nestjs/cqrs';

export class ResolveIncidentCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly incidentId: string,
    public readonly resolvedBy: string,
    public readonly resolutionNotes?: string,
  ) {}
}
