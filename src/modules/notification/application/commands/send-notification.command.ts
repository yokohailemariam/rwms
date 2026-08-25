import { ICommand } from '@nestjs/cqrs';
import {
  NotificationChannel,
  NotificationType,
} from '../../notification.types';

export class SendNotificationCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly recipientId: string,
    public readonly type: NotificationType,
    public readonly channel: NotificationChannel,
    public readonly title: string,
    public readonly body: string,
    public readonly recipientEmail?: string,
    public readonly recipientPhone?: string,
    public readonly data?: Record<string, any>,
  ) {}
}
