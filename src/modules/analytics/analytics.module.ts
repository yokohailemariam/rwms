import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnalyticsController } from './infrastructure/http/analytics.controller';
import { WorkforceKpisHandler } from './application/queries/workforce-kpis.handler';
import { AttendanceTrendsHandler } from './application/queries/attendance-trends.handler';

@Module({
  imports: [CqrsModule],
  controllers: [AnalyticsController],
  providers: [WorkforceKpisHandler, AttendanceTrendsHandler],
})
export class AnalyticsModule {}
