import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubmitLeaveCommand } from './submit-leave.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(SubmitLeaveCommand)
export class SubmitLeaveHandler implements ICommandHandler<SubmitLeaveCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SubmitLeaveCommand) {
    const year = command.startDate.getFullYear();
    const balance = await this.prisma.leaveBalance.findFirst({
      where: {
        tenantId: command.tenantId,
        workerId: command.workerId,
        leaveTypeId: command.leaveTypeId,
        year,
      },
    });
    if (!balance)
      throw new NotFoundException('Leave balance not found for this year');

    const available =
      Number(balance.totalDays) -
      Number(balance.usedDays) -
      Number(balance.pendingDays);
    if (available < command.daysRequested) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${available}, Requested: ${command.daysRequested}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: { pendingDays: { increment: command.daysRequested } },
      });

      return tx.leaveRequest.create({
        data: {
          tenantId: command.tenantId,
          workerId: command.workerId,
          leaveTypeId: command.leaveTypeId,
          startDate: command.startDate,
          endDate: command.endDate,
          requestedDays: command.daysRequested,
          reason: command.reason,
          status: 'PENDING',
        },
      });
    });
  }
}
