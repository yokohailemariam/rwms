import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../../common/types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get('jwt.accessSecret') || 'change-me-access-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    return {
      sub: payload.sub,
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
