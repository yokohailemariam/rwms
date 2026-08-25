export const QUEUE_NAMES = {
  ATTENDANCE: 'attendance',
  ATTENDANCE_PROCESSING: 'attendance-processing',
  PAYROLL: 'payroll',
  PAYROLL_GENERATION: 'payroll-generation',
  NOTIFICATIONS: 'notifications',
  NOTIFICATION: 'notification-dispatch',
  KIOSK_SYNC: 'kiosk-sync',
  REPORT_GENERATION: 'report-generation',
  EMAIL: 'email',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
