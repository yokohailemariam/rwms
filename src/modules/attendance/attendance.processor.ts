import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../../common/constants/queue-names.constant';

interface ComputeOvertimeJobData {
  recordId: string;
}

@Processor(QUEUE_NAMES.ATTENDANCE)
export class AttendanceProcessor extends WorkerHost {
  private readonly logger = new Logger(AttendanceProcessor.name);

  process(job: Job<unknown>): Promise<unknown> {
    this.logger.debug(`Processing attendance job: ${job.name} [${job.id}]`);
    switch (job.name) {
      case 'compute-overtime':
        return Promise.resolve(
          this.computeOvertime(job.data as ComputeOvertimeJobData),
        );
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        return Promise.resolve(undefined);
    }
  }

  private computeOvertime(data: ComputeOvertimeJobData) {
    this.logger.log(`Computing overtime for record ${data.recordId}`);
    // Overtime computation is handled inline in ClockOutHandler.
    // This processor handles async post-processing like notifications.
    return { processed: true };
  }
}
