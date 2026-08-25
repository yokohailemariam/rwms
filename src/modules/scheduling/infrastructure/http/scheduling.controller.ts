import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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
import { CreateShiftCommand } from '../../application/commands/create-shift.command';
import { AssignShiftCommand } from '../../application/commands/assign-shift.command';
import { GetRosterQuery } from '../../application/queries/get-roster.query';
import { CreateShiftDto } from './dto/create-shift.dto';
import { AssignShiftDto } from './dto/assign-shift.dto';

@ApiTags('Scheduling')
@Controller('api/v1/scheduling')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchedulingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('shifts')
  @ApiOperation({ summary: 'Create a shift template' })
  createShift(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateShiftDto,
  ) {
    return this.commandBus.execute(
      new CreateShiftCommand(
        user.tenantId!,
        dto.factoryId,
        dto.name,
        dto.startTime,
        dto.endTime,
        dto.durationMinutes,
        dto.overnightShift ?? false,
        dto.color,
      ),
    );
  }

  @Post('assignments')
  @ApiOperation({ summary: 'Assign a shift to a worker for a specific date' })
  assignShift(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AssignShiftDto,
  ) {
    return this.commandBus.execute(
      new AssignShiftCommand(
        user.tenantId!,
        dto.workerId,
        dto.shiftId,
        dto.factoryId,
        new Date(dto.date),
        user.userId,
      ),
    );
  }

  @Get('roster')
  @ApiOperation({ summary: 'Get roster for a date range' })
  @ApiQuery({ name: 'factoryId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'departmentId', required: false })
  getRoster(
    @CurrentUser() user: AuthenticatedUser,
    @Query('factoryId') factoryId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.queryBus.execute(
      new GetRosterQuery(
        user.tenantId!,
        factoryId,
        new Date(startDate),
        new Date(endDate),
        departmentId,
      ),
    );
  }
}
