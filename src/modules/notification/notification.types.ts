export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationType {
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  PAYSLIP_READY = 'PAYSLIP_READY',
  EMERGENCY_ALERT = 'EMERGENCY_ALERT',
  SHIFT_ASSIGNED = 'SHIFT_ASSIGNED',
  ATTENDANCE_ANOMALY = 'ATTENDANCE_ANOMALY',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export interface NotificationPayload {
  tenantId: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, any>;
}
