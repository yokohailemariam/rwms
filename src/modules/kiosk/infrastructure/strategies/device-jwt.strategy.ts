import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Injectable()
export class DeviceJwtStrategy extends PassportStrategy(
  Strategy,
  'device-jwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get('jwt.accessSecret') || 'change-me-access-secret',
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'kiosk')
      throw new UnauthorizedException('Invalid device token');

    const device = await this.prisma.kioskDevice.findFirst({
      where: { id: payload.sub, status: 'ACTIVE' },
    });
    if (!device)
      throw new UnauthorizedException('Device not active or not found');

    await this.prisma.kioskDevice.update({
      where: { id: device.id },
      data: { lastHeartbeatAt: new Date() },
    });

    return {
      deviceId: device.id,
      tenantId: device.tenantId,
      factoryId: device.factoryId,
    };
  }
}
