import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RejectLeaveCommand } from './reject-leave.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(RejectLeaveCommand)
export class RejectLeaveHandler implements ICommandHandler<RejectLeaveCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RejectLeaveCommand) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { id: command.requestId, tenantId: command.tenantId },
    });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot reject a request with status: ${request.status}`,
      );
    }

    const year = request.startDate.getFullYear();

    return this.prisma.$transaction(async (tx) => {
      // Release pending days
      await tx.leaveBalance.updateMany({
        where: {
          tenantId: command.tenantId,
          workerId: request.workerId,
          leaveTypeId: request.leaveTypeId,
          year,
        },
        data: { pendingDays: { decrement: Number(request.requestedDays) } },
      });

      return tx.leaveRequest.update({
        where: { id: command.requestId },
        data: {
          status: 'REJECTED',
          approverId: command.reviewerId,
          approverNotes: command.notes,
          reviewedAt: new Date(),
        },
      });
    });
  }
}
