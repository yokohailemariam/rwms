import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AnonymizeWorkerCommand } from './anonymize-worker.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(AnonymizeWorkerCommand)
export class AnonymizeWorkerHandler implements ICommandHandler<AnonymizeWorkerCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AnonymizeWorkerCommand) {
    const worker = await this.prisma.worker.findFirst({
      where: { id: command.workerId, tenantId: command.tenantId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const anonymizedId = `ANON-${worker.id.substring(0, 8)}`;

    await this.prisma.$transaction([
      this.prisma.worker.update({
        where: { id: command.workerId },
        data: {
          firstName: 'ANONYMIZED',
          lastName: anonymizedId,
          email: null,
          phone: null,
          nfcCardId: null,
          status: 'TERMINATED',
        },
      }),
      this.prisma.auditLog.create({
        data: {
          tenantId: command.tenantId,
          actorId: command.requestedBy,
          action: 'WORKER_ANONYMIZED',
          resourceType: 'Worker',
          resourceId: command.workerId,
          metadata: { reason: command.reason },
        },
      }),
    ]);

    return {
      message: 'Worker data anonymized successfully',
      workerId: command.workerId,
    };
  }
}
