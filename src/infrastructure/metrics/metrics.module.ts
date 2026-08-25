import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
    }),
  ],
  providers: [
    makeCounterProvider({
      name: 'rwms_attendance_clock_ins_total',
      help: 'Total number of clock-in events',
      labelNames: ['tenant_id', 'factory_id', 'method'],
    }),
    makeGaugeProvider({
      name: 'rwms_active_kiosks',
      help: 'Number of currently active kiosk devices',
      labelNames: ['tenant_id', 'factory_id'],
    }),
    makeGaugeProvider({
      name: 'rwms_queue_depth',
      help: 'Current depth of processing queues',
      labelNames: ['queue_name'],
    }),
  ],
  exports: [PrometheusModule],
})
export class MetricsModule {}
