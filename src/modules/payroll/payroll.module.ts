import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../common/constants/queue-names.constant';
import { PayrollController } from './infrastructure/http/payroll.controller';
import { CreatePayrollPeriodHandler } from './application/commands/create-payroll-period.handler';
import { GeneratePayrollHandler } from './application/commands/generate-payroll.handler';
import { GetPayslipHandler } from './application/queries/get-payslip.handler';
import { ListPayslipsHandler } from './application/queries/list-payslips.handler';
import { PayrollProcessor } from './payroll.processor';

const CommandHandlers = [CreatePayrollPeriodHandler, GeneratePayrollHandler];
const QueryHandlers = [GetPayslipHandler, ListPayslipsHandler];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.PAYROLL }),
  ],
  controllers: [PayrollController],
  providers: [...CommandHandlers, ...QueryHandlers, PayrollProcessor],
})
export class PayrollModule {}
