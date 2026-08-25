export interface KioskSyncCompletedPayload {
  kioskId: string;
  tenantId: string;
  factoryId: string;
  batchReference: string;
  processedCount: number;
  failedCount: number;
  syncedAt: string;
}

export interface KioskRegisteredPayload {
  kioskId: string;
  tenantId: string;
  factoryId: string;
  serialNumber: string;
  registeredAt: string;
}

export const KIOSK_EVENT_TYPES = {
  KIOSK_REGISTERED: 'kiosk.registered.v1',
  KIOSK_APPROVED: 'kiosk.approved.v1',
  KIOSK_SYNC_COMPLETED: 'kiosk.sync-completed.v1',
} as const;
