import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../../common/types/jwt-payload.type';
import { ClockInCommand } from '../../application/commands/clock-in.command';
import { ClockOutCommand } from '../../application/commands/clock-out.command';
import { CorrectAttendanceCommand } from '../../application/commands/correct-attendance.command';
import { GetWorkerAttendanceQuery } from '../../application/queries/get-worker-attendance.query';
import { GetDailyAttendanceQuery } from '../../application/queries/get-daily-attendance.query';
import { ClockInDto, ClockOutDto } from './dto/clock-in.dto';

class CorrectAttendanceDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() clockInTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() clockOutTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

@ApiTags('Attendance')
@Controller('api/v1/attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('clock-in')
  @ApiOperation({ summary: 'Record clock-in' })
  clockIn(@CurrentUser() user: AuthenticatedUser, @Body() dto: ClockInDto) {
    return this.commandBus.execute(
      new ClockInCommand(
        user.tenantId!,
        dto.workerId,
        dto.factoryId,
        dto.source,
        dto.timestamp ? new Date(dto.timestamp) : new Date(),
        dto.shiftId,
        dto.latitude,
        dto.longitude,
        dto.kioskDeviceId,
        dto.nfcCardId,
      ),
    );
  }

  @Post('clock-out')
  @ApiOperation({ summary: 'Record clock-out' })
  clockOut(@CurrentUser() user: AuthenticatedUser, @Body() dto: ClockOutDto) {
    return this.commandBus.execute(
      new ClockOutCommand(
        user.tenantId!,
        dto.workerId,
        dto.source,
        dto.timestamp ? new Date(dto.timestamp) : new Date(),
        dto.latitude,
        dto.longitude,
        dto.kioskDeviceId,
      ),
    );
  }

  @Patch(':id/correct')
  @ApiOperation({ summary: 'Correct an attendance record' })
  correct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CorrectAttendanceDto,
  ) {
    return this.commandBus.execute(
      new CorrectAttendanceCommand(
        user.tenantId!,
        id,
        user.userId,
        dto.clockInTime ? new Date(dto.clockInTime) : undefined,
        dto.clockOutTime ? new Date(dto.clockOutTime) : undefined,
        dto.notes,
      ),
    );
  }

  @Get('worker/:workerId')
  @ApiOperation({ summary: 'Get attendance records for a worker' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getWorkerAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workerId') workerId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page = '1',
    @Query('limit') limit = '30',
  ) {
    return this.queryBus.execute(
      new GetWorkerAttendanceQuery(
        user.tenantId!,
        workerId,
        new Date(startDate),
        new Date(endDate),
        parseInt(page, 10),
        parseInt(limit, 10),
      ),
    );
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily attendance for a factory' })
  @ApiQuery({ name: 'factoryId', required: true })
  @ApiQuery({ name: 'date', required: true })
  getDailyAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Query('factoryId') factoryId: string,
    @Query('date') date: string,
  ) {
    return this.queryBus.execute(
      new GetDailyAttendanceQuery(user.tenantId!, factoryId, new Date(date)),
    );
  }
}
