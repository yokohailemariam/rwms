import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetPayslipQuery } from './get-payslip.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { StorageService } from '../../../../infrastructure/storage/storage.service';

@QueryHandler(GetPayslipQuery)
export class GetPayslipHandler implements IQueryHandler<GetPayslipQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async execute(query: GetPayslipQuery) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { id: query.payslipId, tenantId: query.tenantId },
      include: {
        worker: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
          },
        },
        payrollPeriod: {
          select: { id: true, name: true, startDate: true, endDate: true },
        },
      },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');

    let downloadUrl: string | null = null;
    if (payslip.pdfKey) {
      downloadUrl = await this.storage.getPresignedUrl(
        'rwms-payslips',
        payslip.pdfKey,
        900,
      );
    }

    return { ...payslip, downloadUrl };
  }
}
