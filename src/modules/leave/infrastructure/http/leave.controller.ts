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
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../../common/types/jwt-payload.type';
import { SubmitLeaveCommand } from '../../application/commands/submit-leave.command';
import { ApproveLeaveCommand } from '../../application/commands/approve-leave.command';
import { RejectLeaveCommand } from '../../application/commands/reject-leave.command';
import { GetLeaveRequestsQuery } from '../../application/queries/get-leave-requests.query';
import { GetLeaveBalanceQuery } from '../../application/queries/get-leave-balance.query';
import { SubmitLeaveDto, ReviewLeaveDto } from './dto/submit-leave.dto';

@ApiTags('Leave')
@Controller('api/v1/leave')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeaveController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('requests')
  @ApiOperation({ summary: 'Submit a leave request' })
  submit(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitLeaveDto) {
    return this.commandBus.execute(
      new SubmitLeaveCommand(
        user.tenantId!,
        user.userId,
        dto.leaveTypeId,
        new Date(dto.startDate),
        new Date(dto.endDate),
        dto.daysRequested,
        dto.reason,
      ),
    );
  }

  @Get('requests')
  @ApiOperation({ summary: 'List leave requests' })
  @ApiQuery({ name: 'workerId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('workerId') workerId?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.queryBus.execute(
      new GetLeaveRequestsQuery(
        user.tenantId!,
        workerId,
        status,
        parseInt(page, 10),
        parseInt(limit, 10),
      ),
    );
  }

  @Patch('requests/:id/approve')
  @ApiOperation({ summary: 'Approve a leave request' })
  approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ReviewLeaveDto,
  ) {
    return this.commandBus.execute(
      new ApproveLeaveCommand(user.tenantId!, id, user.userId, dto.notes),
    );
  }

  @Patch('requests/:id/reject')
  @ApiOperation({ summary: 'Reject a leave request' })
  reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ReviewLeaveDto,
  ) {
    return this.commandBus.execute(
      new RejectLeaveCommand(user.tenantId!, id, user.userId, dto.notes),
    );
  }

  @Get('balance/:workerId')
  @ApiOperation({ summary: 'Get leave balance for a worker' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getBalance(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workerId') workerId: string,
    @Query('year') year?: string,
  ) {
    return this.queryBus.execute(
      new GetLeaveBalanceQuery(
        user.tenantId!,
        workerId,
        year ? parseInt(year, 10) : undefined,
      ),
    );
  }
}
