import { ICommand } from '@nestjs/cqrs';

export interface SyncRecord {
  workerId?: string;
  nfcCardId?: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  timestamp: string;
  localId: string;
}

export class SyncBatchCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly deviceId: string,
    public readonly factoryId: string,
    public readonly records: SyncRecord[],
    public readonly batchId: string,
  ) {}
}
