import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { HealthIndicatorResult } from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe - checks DB + Redis' })
  readiness() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.checkRedis(),
    ]);
  }

  private async checkRedis(): Promise<HealthIndicatorResult> {
    const key = 'health:ping';
    try {
      await this.redis.set(key, '1');
      const val = await this.redis.get(key);
      await this.redis.del(key);
      if (val === '1') {
        return { redis: { status: 'up' } };
      }
      return { redis: { status: 'down', message: 'Unexpected value' } };
    } catch (error) {
      return { redis: { status: 'down', message: error.message } };
    }
  }
}
