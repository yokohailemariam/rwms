import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { GeneratePayrollCommand } from './generate-payroll.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { QUEUE_NAMES } from '../../../../common/constants/queue-names.constant';

@CommandHandler(GeneratePayrollCommand)
export class GeneratePayrollHandler implements ICommandHandler<GeneratePayrollCommand> {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.PAYROLL) private readonly payrollQueue: Queue,
  ) {}

  async execute(command: GeneratePayrollCommand) {
    const period = await this.prisma.payrollPeriod.findFirst({
      where: { id: command.periodId, tenantId: command.tenantId },
    });
    if (!period) throw new NotFoundException('Payroll period not found');
    if (period.status !== 'DRAFT') {
      throw new BadRequestException(
        `Cannot generate payroll for period with status: ${period.status}`,
      );
    }

    await this.prisma.payrollPeriod.update({
      where: { id: command.periodId },
      data: { status: 'PROCESSING' },
    });

    await this.payrollQueue.add('generate-payslips', {
      tenantId: command.tenantId,
      periodId: command.periodId,
      triggeredBy: command.triggeredBy,
    });

    return { message: 'Payroll generation queued', periodId: command.periodId };
  }
}
