import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../common/constants/queue-names.constant';
import { NotificationController } from './infrastructure/http/notification.controller';
import { SendNotificationHandler } from './application/commands/send-notification.handler';
import { NotificationProcessor } from './notification.processor';
import { EmailProvider } from './infrastructure/providers/email.provider';
import { SmsProvider } from './infrastructure/providers/sms.provider';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.NOTIFICATIONS }),
  ],
  controllers: [NotificationController],
  providers: [
    SendNotificationHandler,
    NotificationProcessor,
    EmailProvider,
    SmsProvider,
  ],
  exports: [SendNotificationHandler],
})
export class NotificationModule {}
