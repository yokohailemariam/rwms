export interface PayrollGeneratedPayload {
  payrollPeriodId: string;
  tenantId: string;
  workerCount: number;
  totalGross: number;
  totalNet: number;
  currency: string;
  periodName: string;
}

export interface PayslipIssuedPayload {
  payslipId: string;
  workerId: string;
  tenantId: string;
  payrollPeriodId: string;
  netPay: number;
  currency: string;
  pdfKey?: string;
}

export const PAYROLL_EVENT_TYPES = {
  PAYROLL_GENERATED: 'payroll.generated.v1',
  PAYSLIP_ISSUED: 'payroll.payslip-issued.v1',
} as const;
