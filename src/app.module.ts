import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config';

// Infrastructure
import { PrismaModule } from './infrastructure/database/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { KafkaModule } from './infrastructure/kafka/kafka.module';
import { OutboxModule } from './infrastructure/outbox/outbox.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { HealthModule } from './infrastructure/health/health.module';
import { MetricsModule } from './infrastructure/metrics/metrics.module';

// Feature Modules
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { AuthModule } from './modules/auth/auth.module';
import { IdentityModule } from './modules/identity/identity.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { LeaveModule } from './modules/leave/leave.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { KioskModule } from './modules/kiosk/kiosk.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host') || 'localhost',
          port: config.get('redis.port') || 6379,
          password: config.get('redis.password'),
        },
      }),
    }),
    ScheduleModule.forRoot(),

    // Infrastructure
    PrismaModule,
    RedisModule,
    KafkaModule,
    OutboxModule,
    StorageModule,
    HealthModule,
    MetricsModule,

    // Feature modules
    TenancyModule,
    AuthModule,
    IdentityModule,
    AttendanceModule,
    SchedulingModule,
    LeaveModule,
    PayrollModule,
    KioskModule,
    EmergencyModule,
    NotificationModule,
    AnalyticsModule,
    ComplianceModule,
    RealtimeModule,
  ],
})
export class AppModule {}
