import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { CreatePayrollPeriodCommand } from './create-payroll-period.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(CreatePayrollPeriodCommand)
export class CreatePayrollPeriodHandler implements ICommandHandler<CreatePayrollPeriodCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreatePayrollPeriodCommand) {
    const overlap = await this.prisma.payrollPeriod.findFirst({
      where: {
        tenantId: command.tenantId,
        status: { not: 'COMPLETED' },
        OR: [
          {
            startDate: { lte: command.endDate },
            endDate: { gte: command.startDate },
          },
        ],
      },
    });
    if (overlap) {
      throw new ConflictException(
        'A payroll period overlaps with an existing one',
      );
    }

    return this.prisma.payrollPeriod.create({
      data: {
        tenantId: command.tenantId,
        name: command.name,
        startDate: command.startDate,
        endDate: command.endDate,
        currency: command.currency,
        status: 'DRAFT',
      },
    });
  }
}
