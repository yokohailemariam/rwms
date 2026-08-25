export class KioskDeviceEntity {
  id: string;
  tenantId: string;
  factoryId: string;
  serialNumber: string;
  name: string;
  location?: string;
  status: string; // PENDING | APPROVED | SUSPENDED | REVOKED
  lastHeartbeatAt?: Date;
  lastSyncAt?: Date;
  firmwareVersion?: string;

  isApproved(): boolean {
    return this.status === 'APPROVED';
  }

  approve(): void {
    this.status = 'APPROVED';
  }

  suspend(): void {
    this.status = 'SUSPENDED';
  }
}
