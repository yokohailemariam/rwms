import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApproveLeaveCommand } from './approve-leave.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(ApproveLeaveCommand)
export class ApproveLeaveHandler implements ICommandHandler<ApproveLeaveCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ApproveLeaveCommand) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id: command.requestId, tenantId: command.tenantId },
    });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot approve a request with status: ${request.status}`,
      );
    }

    const year = request.startDate.getFullYear();

    return this.prisma.$transaction(async (tx) => {
      // Move from pending to used
      await tx.leaveBalance.updateMany({
        where: {
          tenantId: command.tenantId,
          workerId: request.workerId,
          leaveTypeId: request.leaveTypeId,
          year,
        },
        data: {
          usedDays: { increment: Number(request.requestedDays) },
          pendingDays: { decrement: Number(request.requestedDays) },
        },
      });

      return tx.leaveRequest.update({
        where: { id: command.requestId },
        data: {
          status: 'APPROVED',
          approverId: command.reviewerId,
          approverNotes: command.notes,
          reviewedAt: new Date(),
        },
      });
    });
  }
}
