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
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsPositive,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../../common/types/jwt-payload.type';
import { CreateWorkerCommand } from '../../application/commands/create-worker.command';
import { UpdateWorkerCommand } from '../../application/commands/update-worker.command';
import { DeactivateWorkerCommand } from '../../application/commands/deactivate-worker.command';
import { GetWorkerQuery } from '../../application/queries/get-worker.query';
import { ListWorkersQuery } from '../../application/queries/list-workers.query';
import { CreateWorkerDto } from './dto/create-worker.dto';

class UpdateWorkerDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nfcCardId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobTitle?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  salary?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
}

class DeactivateWorkerDto {
  @ApiProperty({ enum: ['INACTIVE', 'SUSPENDED', 'TERMINATED'] })
  @IsIn(['INACTIVE', 'SUSPENDED', 'TERMINATED'])
  status: 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';

  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}

@ApiTags('Workers')
@Controller('api/v1/workers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new worker' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateWorkerDto) {
    return this.commandBus.execute(
      new CreateWorkerCommand(
        user.tenantId!,
        dto.factoryId,
        dto.employeeId,
        dto.firstName,
        dto.lastName,
        new Date(dto.hireDate),
        dto.departmentId,
        dto.phone,
        dto.email,
        dto.nfcCardId,
        dto.jobTitle,
        dto.salary,
        dto.currency,
      ),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List workers with filters' })
  @ApiQuery({ name: 'factoryId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('factoryId') factoryId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.queryBus.execute(
      new ListWorkersQuery(
        user.tenantId!,
        factoryId,
        departmentId,
        status,
        search,
        parseInt(page, 10),
        parseInt(limit, 10),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single worker' })
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.queryBus.execute(new GetWorkerQuery(user.tenantId!, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update worker details' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateWorkerDto,
  ) {
    return this.commandBus.execute(
      new UpdateWorkerCommand(
        user.tenantId!,
        id,
        dto.firstName,
        dto.lastName,
        dto.phone,
        dto.email,
        dto.departmentId,
        dto.nfcCardId,
        dto.jobTitle,
        dto.salary,
        dto.currency,
      ),
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Deactivate / suspend / terminate worker' })
  deactivate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: DeactivateWorkerDto,
  ) {
    return this.commandBus.execute(
      new DeactivateWorkerCommand(user.tenantId!, id, dto.status, dto.reason),
    );
  }
}
