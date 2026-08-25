import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../../common/types/jwt-payload.type';
import { WorkforceKpisQuery } from '../../application/queries/workforce-kpis.query';
import { AttendanceTrendsQuery } from '../../application/queries/attendance-trends.query';

@ApiTags('Analytics')
@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get workforce KPIs' })
  @ApiQuery({ name: 'factoryId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getKpis(
    @CurrentUser() user: AuthenticatedUser,
    @Query('factoryId') factoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.queryBus.execute(
      new WorkforceKpisQuery(
        user.tenantId!,
        factoryId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
  }

  @Get('attendance-trends')
  @ApiOperation({ summary: 'Get attendance trends' })
  @ApiQuery({ name: 'factoryId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({
    name: 'granularity',
    required: false,
    enum: ['daily', 'weekly', 'monthly'],
  })
  getAttendanceTrends(
    @CurrentUser() user: AuthenticatedUser,
    @Query('factoryId') factoryId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity: 'daily' | 'weekly' | 'monthly' = 'daily',
  ) {
    return this.queryBus.execute(
      new AttendanceTrendsQuery(
        user.tenantId!,
        factoryId,
        new Date(startDate),
        new Date(endDate),
        granularity,
      ),
    );
  }
}
