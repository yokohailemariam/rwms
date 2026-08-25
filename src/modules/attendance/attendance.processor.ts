import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../../common/constants/queue-names.constant';

@Processor(QUEUE_NAMES.ATTENDANCE)
export class AttendanceProcessor extends WorkerHost {
  private readonly logger = new Logger(AttendanceProcessor.name);

  async process(job: Job) {
    this.logger.debug(`Processing attendance job: ${job.name} [${job.id}]`);
    switch (job.name) {
      case 'compute-overtime':
        return this.computeOvertime(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async computeOvertime(data: any) {
    this.logger.log(`Computing overtime for record ${data.recordId}`);
    // Overtime computation is handled inline in ClockOutHandler.
    // This processor handles async post-processing like notifications.
    return { processed: true };
  }
}
