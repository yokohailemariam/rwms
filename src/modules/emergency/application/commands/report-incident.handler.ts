import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReportIncidentCommand } from './report-incident.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { OutboxService } from '../../../../infrastructure/outbox/outbox.service';
import {
  IncidentType,
  Severity,
} from '../../../../infrastructure/database/generated/prisma/client';

@CommandHandler(ReportIncidentCommand)
export class ReportIncidentHandler implements ICommandHandler<ReportIncidentCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: ReportIncidentCommand) {
    const incident = await this.prisma.emergencyIncident.create({
      data: {
        tenantId: command.tenantId,
        factoryId: command.factoryId,
        reporterId: command.reportedBy,
        incidentType: command.incidentType as IncidentType,
        severity: command.severity as Severity,
        title: command.title,
        description: command.description,
        location: command.location,
        affectedWorkerCount: command.affectedWorkers,
        status: 'OPEN',
      },
    });

    await this.outbox.publish(
      command.tenantId,
      'emergency.incident.reported.v1',
      incident.id,
      'EmergencyIncident',
      {
        incidentId: incident.id,
        tenantId: incident.tenantId,
        factoryId: incident.factoryId,
        severity: incident.severity,
        title: incident.title,
      },
    );

    return incident;
  }
}
