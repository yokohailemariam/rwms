import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ApproveKioskCommand } from './approve-kiosk.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

@CommandHandler(ApproveKioskCommand)
export class ApproveKioskHandler implements ICommandHandler<ApproveKioskCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: ApproveKioskCommand) {
    const device = await this.prisma.kioskDevice.findFirst({
      where: { id: command.deviceId, tenantId: command.tenantId },
    });
    if (!device) throw new NotFoundException('Kiosk device not found');

    const deviceToken = this.jwtService.sign(
      {
        sub: device.id,
        tenantId: command.tenantId,
        factoryId: device.factoryId,
        type: 'kiosk',
      },
      { expiresIn: '365d' },
    );

    const updated = await this.prisma.kioskDevice.update({
      where: { id: command.deviceId },
      data: {
        status: 'ACTIVE',
        settings: {
          ...((device.settings as any) || {}),
          approvedBy: command.approvedBy,
          deviceToken,
        },
      },
    });

    return { device: updated, deviceToken };
  }
}
