import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendNotificationCommand } from './send-notification.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { QUEUE_NAMES } from '../../../../common/constants/queue-names.constant';
import { Prisma } from '../../../../infrastructure/database/generated/prisma/client';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS)
    private readonly notificationQueue: Queue,
  ) {}

  async execute(command: SendNotificationCommand) {
    const notification = await this.prisma.notification.create({
      data: {
        tenantId: command.tenantId,
        recipientId: command.recipientId,
        type: command.channel,
        title: command.title,
        body: command.body,
        channel: command.channel,
        metadata: command.data as Prisma.InputJsonValue | undefined,
        status: 'PENDING',
      },
    });

    await this.notificationQueue.add('send', {
      notificationId: notification.id,
      recipientEmail: command.recipientEmail,
      recipientPhone: command.recipientPhone,
    });

    return notification;
  }
}
