import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateShiftCommand } from './create-shift.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@CommandHandler(CreateShiftCommand)
export class CreateShiftHandler implements ICommandHandler<CreateShiftCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateShiftCommand) {
    return this.prisma.shift.create({
      data: {
        tenantId: command.tenantId,
        factoryId: command.factoryId,
        name: command.name,
        startTime: command.startTime,
        endTime: command.endTime,
        durationMinutes: command.durationMinutes,
        isNightShift: command.overnightShift,
        isActive: true,
      },
    });
  }
}
