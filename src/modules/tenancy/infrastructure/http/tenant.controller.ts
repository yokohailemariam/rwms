import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTenantCommand } from '../../application/commands/create-tenant.command';
import { GetTenantQuery } from '../../application/queries/get-tenant.query';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/types/roles.enum';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('api/v1/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.SAAS_ADMIN)
  @ApiOperation({ summary: 'Create a new tenant (SAAS_ADMIN only)' })
  create(@Body() dto: CreateTenantDto) {
    return this.commandBus.execute(
      new CreateTenantCommand(
        dto.name,
        dto.slug,
        dto.ownerEmail,
        dto.ownerFirstName,
        dto.ownerLastName,
        dto.planTier,
      ),
    );
  }

  @Get(':id')
  @Roles(UserRole.SAAS_ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Get tenant by ID' })
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetTenantQuery(id));
  }
}
