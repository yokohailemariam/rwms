import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ResolveIncidentCommand } from './resolve-incident.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(ResolveIncidentCommand)
export class ResolveIncidentHandler implements ICommandHandler<ResolveIncidentCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ResolveIncidentCommand) {
    const incident = await this.prisma.emergencyIncident.findFirst({
      where: { id: command.incidentId, tenantId: command.tenantId },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.emergencyIncident.update({
      where: { id: command.incidentId },
      data: {
        status: 'RESOLVED',
        resolvedById: command.resolvedBy,
        resolvedAt: new Date(),
      },
    });
  }
}
