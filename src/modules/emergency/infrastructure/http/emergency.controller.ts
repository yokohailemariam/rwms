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
import { ReportIncidentCommand } from '../../application/commands/report-incident.command';
import { ResolveIncidentCommand } from '../../application/commands/resolve-incident.command';
import { ListIncidentsQuery } from '../../application/queries/list-incidents.query';
import {
  ReportIncidentDto,
  ResolveIncidentDto,
} from './dto/report-incident.dto';

@ApiTags('Emergency')
@Controller('api/v1/emergency')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmergencyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('incidents')
  @ApiOperation({ summary: 'Report an emergency incident' })
  report(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReportIncidentDto,
  ) {
    return this.commandBus.execute(
      new ReportIncidentCommand(
        user.tenantId!,
        dto.factoryId,
        dto.title,
        dto.description,
        dto.severity,
        user.userId,
        dto.incidentType ?? 'OTHER',
        dto.location ?? 'Unknown',
        dto.affectedWorkers ?? 0,
        dto.latitude,
        dto.longitude,
      ),
    );
  }

  @Patch('incidents/:id/resolve')
  @ApiOperation({ summary: 'Resolve an emergency incident' })
  resolve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ResolveIncidentDto,
  ) {
    return this.commandBus.execute(
      new ResolveIncidentCommand(
        user.tenantId!,
        id,
        user.userId,
        dto.resolutionNotes,
      ),
    );
  }

  @Get('incidents')
  @ApiOperation({ summary: 'List emergency incidents' })
  @ApiQuery({ name: 'factoryId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('factoryId') factoryId?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.queryBus.execute(
      new ListIncidentsQuery(
        user.tenantId!,
        factoryId,
        status,
        severity,
        parseInt(page, 10),
        parseInt(limit, 10),
      ),
    );
  }
}
