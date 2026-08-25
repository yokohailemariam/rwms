import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { QUEUE_NAMES } from '../../common/constants/queue-names.constant';

@Processor(QUEUE_NAMES.PAYROLL)
export class PayrollProcessor extends WorkerHost {
  private readonly logger = new Logger(PayrollProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing payroll job: ${job.name} [${job.id}]`);
    switch (job.name) {
      case 'generate-payslips':
        return this.generatePayslips(job.data);
      default:
        this.logger.warn(`Unknown payroll job: ${job.name}`);
    }
  }

  private async generatePayslips(data: {
    tenantId: string;
    periodId: string;
    triggeredBy: string;
  }) {
    const { tenantId, periodId } = data;

    const period = await this.prisma.payrollPeriod.findFirst({
      where: { id: periodId, tenantId },
    });
    if (!period) {
      this.logger.error(`Payroll period ${periodId} not found`);
      return;
    }

    const workers = await this.prisma.worker.findMany({
      where: { tenantId, status: 'ACTIVE' },
    });

    this.logger.log(
      `Generating ${workers.length} payslips for period ${period.name}`,
    );

    let totalGross = 0;
    let totalNet = 0;

    for (const worker of workers) {
      const attendanceAgg = await this.prisma.attendanceRecord.aggregate({
        where: {
          tenantId,
          workerId: worker.id,
          clockInTime: { gte: period.startDate, lte: period.endDate },
        },
        _sum: { hoursWorked: true, overtimeHours: true },
      });

      const hoursWorked = Number(attendanceAgg._sum.hoursWorked ?? 0);
      const overtimeHours = Number(attendanceAgg._sum.overtimeHours ?? 0);
      const baseSalary = Number(worker.salary ?? 0);
      const hourlyRate = baseSalary / 160;
      const overtimePay = overtimeHours * hourlyRate * 1.5;
      const grossPay = baseSalary + overtimePay;
      const taxDeduction = grossPay * 0.15;
      const netPay = grossPay - taxDeduction;

      totalGross += grossPay;
      totalNet += netPay;

      // Upsert to avoid duplicates
      await this.prisma.payslip.upsert({
        where: {
          workerId_payrollPeriodId: {
            workerId: worker.id,
            payrollPeriodId: periodId,
          },
        },
        update: {
          basicSalary: baseSalary,
          grossPay,
          netPay,
          hoursWorked,
          overtimeHours,
        },
        create: {
          tenantId,
          workerId: worker.id,
          payrollPeriodId: periodId,
          basicSalary: baseSalary,
          allowances: [],
          deductions: [{ label: 'Income Tax (15%)', amount: taxDeduction }],
          grossPay,
          netPay,
          hoursWorked,
          overtimeHours,
          status: 'DRAFT',
        },
      });
    }

    await this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: 'COMPLETED',
        totalGross,
        totalNet,
        totalDeductions: totalGross - totalNet,
        processedAt: new Date(),
      },
    });

    this.logger.log(`Payroll generation complete for period ${period.name}`);
  }
}
