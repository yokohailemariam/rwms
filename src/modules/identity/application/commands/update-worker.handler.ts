import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateWorkerCommand } from './update-worker.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(UpdateWorkerCommand)
export class UpdateWorkerHandler implements ICommandHandler<UpdateWorkerCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateWorkerCommand) {
    const worker = await this.prisma.worker.findFirst({
      where: { id: command.workerId, tenantId: command.tenantId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    return this.prisma.worker.update({
      where: { id: command.workerId },
      data: {
        ...(command.firstName !== undefined && {
          firstName: command.firstName,
        }),
        ...(command.lastName !== undefined && { lastName: command.lastName }),
        ...(command.phone !== undefined && { phone: command.phone }),
        ...(command.email !== undefined && { email: command.email }),
        ...(command.departmentId !== undefined && {
          departmentId: command.departmentId,
        }),
        ...(command.nfcCardId !== undefined && {
          nfcCardId: command.nfcCardId,
        }),
        ...(command.jobTitle !== undefined && { jobTitle: command.jobTitle }),
        ...(command.salary !== undefined && { salary: command.salary }),
        ...(command.currency !== undefined && { currency: command.currency }),
      },
    });
  }
}
