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
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../../common/types/jwt-payload.type';
import { AuditLogsQuery } from '../../application/queries/audit-logs.query';
import { AnonymizeWorkerCommand } from '../../application/commands/anonymize-worker.command';

class AnonymizeWorkerDto {
  @ApiProperty({ example: 'GDPR request from worker' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

@ApiTags('Compliance')
@Controller('api/v1/compliance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ComplianceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAuditLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.queryBus.execute(
      new AuditLogsQuery(
        user.tenantId!,
        userId,
        action,
        resource,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        parseInt(page, 10),
        parseInt(limit, 10),
      ),
    );
  }

  @Post('workers/:id/anonymize')
  @ApiOperation({ summary: 'Anonymize worker data (GDPR right to erasure)' })
  anonymize(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AnonymizeWorkerDto,
  ) {
    return this.commandBus.execute(
      new AnonymizeWorkerCommand(user.tenantId!, id, user.userId, dto.reason),
    );
  }
}
