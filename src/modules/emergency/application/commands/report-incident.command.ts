import { ICommand } from '@nestjs/cqrs';

export class ReportIncidentCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly factoryId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly severity: string,
    public readonly reportedBy: string,
    public readonly incidentType: string = 'OTHER',
    public readonly location: string = 'Unknown',
    public readonly affectedWorkers: number = 0,
    public readonly latitude?: number,
    public readonly longitude?: number,
  ) {}
}
