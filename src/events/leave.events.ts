export interface LeaveRequestedPayload {
  leaveRequestId: string;
  workerId: string;
  tenantId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  reason?: string;
}

export interface LeaveApprovedPayload {
  leaveRequestId: string;
  workerId: string;
  tenantId: string;
  approverId: string;
  approverNotes?: string;
}

export interface LeaveRejectedPayload {
  leaveRequestId: string;
  workerId: string;
  tenantId: string;
  approverId: string;
  approverNotes?: string;
}

export const LEAVE_EVENT_TYPES = {
  LEAVE_REQUESTED: 'leave.requested.v1',
  LEAVE_APPROVED: 'leave.approved.v1',
  LEAVE_REJECTED: 'leave.rejected.v1',
  LEAVE_CANCELLED: 'leave.cancelled.v1',
} as const;
