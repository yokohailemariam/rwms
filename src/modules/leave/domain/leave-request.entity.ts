export class LeaveRequestEntity {
  id: string;
  tenantId: string;
  workerId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  reason?: string;
  status: string; // PENDING | APPROVED | REJECTED | CANCELLED
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;

  isPending(): boolean {
    return this.status === 'PENDING';
  }

  approve(reviewerId: string, notes?: string): void {
    this.status = 'APPROVED';
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
  }

  reject(reviewerId: string, notes?: string): void {
    this.status = 'REJECTED';
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
  }
}
