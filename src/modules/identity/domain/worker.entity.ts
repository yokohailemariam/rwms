export class WorkerEntity {
  id: string;
  tenantId: string;
  userId?: string;
  factoryId: string;
  departmentId?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  nfcCardId?: string;
  status: string;
  hireDate: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  deactivate(): void {
    this.status = 'INACTIVE';
  }

  suspend(): void {
    this.status = 'SUSPENDED';
  }

  terminate(): void {
    this.status = 'TERMINATED';
  }
}
