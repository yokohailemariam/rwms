import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { CreateWorkerCommand } from './create-worker.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(CreateWorkerCommand)
export class CreateWorkerHandler implements ICommandHandler<CreateWorkerCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateWorkerCommand) {
    const existing = await this.prisma.worker.findFirst({
      where: { tenantId: command.tenantId, employeeId: command.employeeId },
    });
    if (existing) {
      throw new ConflictException(
        `Employee ID ${command.employeeId} already exists`,
      );
    }

    if (command.nfcCardId) {
      const nfcConflict = await this.prisma.worker.findFirst({
        where: { tenantId: command.tenantId, nfcCardId: command.nfcCardId },
      });
      if (nfcConflict) {
        throw new ConflictException(
          `NFC card ${command.nfcCardId} already assigned`,
        );
      }
    }

    const worker = await this.prisma.worker.create({
      data: {
        tenantId: command.tenantId,
        factoryId: command.factoryId,
        departmentId: command.departmentId,
        employeeId: command.employeeId,
        firstName: command.firstName,
        lastName: command.lastName,
        phone: command.phone,
        email: command.email,
        nfcCardId: command.nfcCardId,
        hireDate: command.hireDate,
        status: 'ACTIVE',
        jobTitle: command.jobTitle,
        salary: command.salary,
        currency: command.currency ?? 'USD',
      },
    });

    return worker;
  }
}
