import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetKioskConfigQuery } from './get-kiosk-config.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@QueryHandler(GetKioskConfigQuery)
export class GetKioskConfigHandler implements IQueryHandler<GetKioskConfigQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetKioskConfigQuery) {
    const device = await this.prisma.kioskDevice.findFirst({
      where: { id: query.deviceId, tenantId: query.tenantId },
      include: {
        factory: { select: { id: true, name: true, timezone: true } },
      },
    });
    if (!device) throw new NotFoundException('Kiosk device not found');

    const settings = (device.settings as any) || {};
    const shifts = await this.prisma.shift.findMany({
      where: {
        tenantId: query.tenantId,
        factoryId: device.factoryId,
        isActive: true,
      },
      select: { id: true, name: true, startTime: true, endTime: true },
    });

    return {
      device: {
        id: device.id,
        name: device.name,
        location: settings.location ?? null,
        status: device.status,
        factory: device.factory,
      },
      shifts,
      serverTime: new Date().toISOString(),
    };
  }
}
