import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EmailProvider } from './infrastructure/providers/email.provider';
import { SmsProvider } from './infrastructure/providers/sms.provider';
import { QUEUE_NAMES } from '../../common/constants/queue-names.constant';

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
  ) {
    super();
  }

  async process(job: Job) {
    const { notificationId, recipientEmail, recipientPhone } = job.data;

    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      this.logger.warn(`Notification ${notificationId} not found`);
      return;
    }

    try {
      if (notification.channel === 'EMAIL' && recipientEmail) {
        await this.emailProvider.sendEmail(
          recipientEmail,
          notification.title,
          notification.body,
        );
      } else if (notification.channel === 'SMS' && recipientPhone) {
        await this.smsProvider.sendSms(recipientPhone, notification.body);
      } else {
        this.logger.log(`In-app notification ${notificationId} stored`);
      }

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (err: any) {
      this.logger.error(
        `Failed to send notification ${notificationId}: ${err.message}`,
      );
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED' },
      });
      throw err;
    }
  }
}
