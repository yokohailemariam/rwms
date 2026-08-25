import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../../common/types/jwt-payload.type';
import { CreatePayrollPeriodCommand } from '../../application/commands/create-payroll-period.command';
import { GeneratePayrollCommand } from '../../application/commands/generate-payroll.command';
import { GetPayslipQuery } from '../../application/queries/get-payslip.query';
import { ListPayslipsQuery } from '../../application/queries/list-payslips.query';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';

@ApiTags('Payroll')
@Controller('api/v1/payroll')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PayrollController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('periods')
  @ApiOperation({ summary: 'Create a payroll period' })
  createPeriod(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePayrollPeriodDto,
  ) {
    return this.commandBus.execute(
      new CreatePayrollPeriodCommand(
        user.tenantId!,
        dto.factoryId,
        dto.name,
        new Date(dto.startDate),
        new Date(dto.endDate),
        dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        dto.currency ?? 'USD',
      ),
    );
  }

  @Post('periods/:id/generate')
  @ApiOperation({ summary: 'Trigger payroll generation for a period' })
  generate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.commandBus.execute(
      new GeneratePayrollCommand(user.tenantId!, id, user.userId),
    );
  }

  @Get('payslips')
  @ApiOperation({ summary: 'List payslips' })
  @ApiQuery({ name: 'workerId', required: false })
  @ApiQuery({ name: 'periodId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listPayslips(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workerId') workerId?: string,
    @Query('periodId') periodId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.queryBus.execute(
      new ListPayslipsQuery(
        user.tenantId!,
        workerId,
        periodId,
        parseInt(page, 10),
        parseInt(limit, 10),
      ),
    );
  }

  @Get('payslips/:id')
  @ApiOperation({ summary: 'Get a single payslip with download URL' })
  getPayslip(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.queryBus.execute(new GetPayslipQuery(user.tenantId!, id));
  }
}
