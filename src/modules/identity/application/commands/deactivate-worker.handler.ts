import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeactivateWorkerCommand } from './deactivate-worker.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(DeactivateWorkerCommand)
export class DeactivateWorkerHandler implements ICommandHandler<DeactivateWorkerCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeactivateWorkerCommand) {
    const worker = await this.prisma.worker.findFirst({
      where: { id: command.workerId, tenantId: command.tenantId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    return this.prisma.worker.update({
      where: { id: command.workerId },
      data: { status: command.status },
    });
  }
}
