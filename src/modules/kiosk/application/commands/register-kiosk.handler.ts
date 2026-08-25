import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { RegisterKioskCommand } from './register-kiosk.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { randomBytes } from 'crypto';

@CommandHandler(RegisterKioskCommand)
export class RegisterKioskHandler implements ICommandHandler<RegisterKioskCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RegisterKioskCommand) {
    const existing = await this.prisma.kioskDevice.findFirst({
      where: { tenantId: command.tenantId, serialNumber: command.serialNumber },
    });
    if (existing)
      throw new ConflictException(
        `Kiosk with serial ${command.serialNumber} already registered`,
      );

    // Generate a placeholder public key (device should supply its real public key in production)
    const placeholderPublicKey = randomBytes(32).toString('hex');

    return this.prisma.kioskDevice.create({
      data: {
        tenantId: command.tenantId,
        factoryId: command.factoryId,
        serialNumber: command.serialNumber,
        name: command.name,
        firmwareVersion: command.firmwareVersion,
        publicKey: placeholderPublicKey,
        status: 'PENDING',
        settings: { location: command.location ?? '' },
      },
    });
  }
}
