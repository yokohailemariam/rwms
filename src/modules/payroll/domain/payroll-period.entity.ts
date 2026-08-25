export class PayrollPeriodEntity {
  id: string;
  tenantId: string;
  factoryId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string; // DRAFT | PROCESSING | COMPLETED | LOCKED
  paymentDate?: Date;
  currency: string;
  totalGross?: number;
  totalNet?: number;
  totalDeductions?: number;

  isDraft(): boolean {
    return this.status === 'DRAFT';
  }

  isLocked(): boolean {
    return this.status === 'LOCKED';
  }

  lock(): void {
    this.status = 'LOCKED';
  }
}
