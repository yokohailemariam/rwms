import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'crypto';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { JwtPayload } from '../../../common/types/jwt-payload.type';

const REFRESH_TOKEN_PREFIX = 'refresh:';

interface JwtConfig {
  refreshSecret: string;
  refreshExpiresIn: string;
}

@Injectable()
export class TokenService {
  private refreshSecret: Uint8Array;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    const secret =
      this.configService.get<JwtConfig>('jwt')?.refreshSecret ||
      'change-me-refresh';
    this.refreshSecret = new TextEncoder().encode(secret);
  }

  async issueAccessToken(user: {
    id: string;
    tenantId: string | null;
    role: string;
    sessionId: string;
  }): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      sessionId: user.sessionId,
    };
    return this.jwtService.signAsync(payload);
  }

  async issueRefreshToken(userId: string, familyId: string): Promise<string> {
    const token = randomUUID();
    const expiresIn =
      this.configService.get<JwtConfig>('jwt')?.refreshExpiresIn || '7d';
    const expiryMs = this.parseDuration(expiresIn);

    const jwtToken = await new SignJWT({ sub: userId, familyId, token })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor((Date.now() + expiryMs) / 1000))
      .sign(this.refreshSecret);

    const ttlSeconds = Math.floor(expiryMs / 1000);
    await this.redis.setex(
      `${REFRESH_TOKEN_PREFIX}${token}`,
      ttlSeconds,
      JSON.stringify({ userId, familyId }),
    );

    return jwtToken;
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token);
  }

  async verifyRefreshToken(jwtToken: string): Promise<{
    sub: string;
    familyId: string;
    token: string;
  }> {
    const { payload } = await jwtVerify(jwtToken, this.refreshSecret);
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.familyId !== 'string' ||
      typeof payload.token !== 'string'
    ) {
      throw new Error('Invalid refresh token payload');
    }
    return {
      sub: payload.sub,
      familyId: payload.familyId,
      token: payload.token,
    };
  }

  async getRefreshTokenData(
    token: string,
  ): Promise<{ userId: string; familyId: string } | null> {
    const data = await this.redis.get(`${REFRESH_TOKEN_PREFIX}${token}`);
    if (!data) return null;
    return JSON.parse(data) as { userId: string; familyId: string };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.redis.del(`${REFRESH_TOKEN_PREFIX}${token}`);
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.redis.setex(`family:revoked:${familyId}`, 60 * 60 * 24 * 7, '1');
  }

  async isFamilyRevoked(familyId: string): Promise<boolean> {
    return this.redis.exists(`family:revoked:${familyId}`);
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[unit] ?? multipliers.d);
  }
}
