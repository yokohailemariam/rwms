import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AssignShiftCommand } from './assign-shift.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(AssignShiftCommand)
export class AssignShiftHandler implements ICommandHandler<AssignShiftCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AssignShiftCommand) {
    const [worker, shift] = await Promise.all([
      this.prisma.worker.findFirst({
        where: { id: command.workerId, tenantId: command.tenantId },
      }),
      this.prisma.shift.findFirst({
        where: { id: command.shiftId, tenantId: command.tenantId },
      }),
    ]);
    if (!worker) throw new NotFoundException('Worker not found');
    if (!shift) throw new NotFoundException('Shift not found');

    return this.prisma.shiftAssignment.upsert({
      where: {
        workerId_date: { workerId: command.workerId, date: command.date },
      },
      update: { shiftId: command.shiftId },
      create: {
        tenantId: command.tenantId,
        workerId: command.workerId,
        shiftId: command.shiftId,
        factoryId: command.factoryId,
        date: command.date,
        status: 'SCHEDULED',
      },
    });
  }
}
