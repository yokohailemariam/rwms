import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../../common/types/jwt-payload.type';
import { RegisterKioskCommand } from '../../application/commands/register-kiosk.command';
import { ApproveKioskCommand } from '../../application/commands/approve-kiosk.command';
import { SyncBatchCommand } from '../../application/commands/sync-batch.command';
import { GetKioskConfigQuery } from '../../application/queries/get-kiosk-config.query';
import { RegisterKioskDto } from './dto/register-kiosk.dto';
import { SyncBatchDto } from './dto/sync-batch.dto';

@ApiTags('Kiosk')
@Controller('api/v1/kiosk')
export class KioskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new kiosk device' })
  register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterKioskDto,
  ) {
    return this.commandBus.execute(
      new RegisterKioskCommand(
        user.tenantId!,
        dto.factoryId,
        dto.serialNumber,
        dto.name,
        dto.location,
        dto.firmwareVersion,
      ),
    );
  }

  @Patch('devices/:id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a kiosk device and issue device token' })
  approve(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.commandBus.execute(
      new ApproveKioskCommand(user.tenantId!, id, user.userId),
    );
  }

  @Get('config')
  @UseGuards(AuthGuard('device-jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get kiosk configuration (device auth)' })
  getConfig(@Req() req: Request) {
    const device = req.user as any;
    return this.queryBus.execute(
      new GetKioskConfigQuery(device.tenantId, device.deviceId),
    );
  }

  @Post('sync')
  @UseGuards(AuthGuard('device-jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync offline attendance records (device auth)' })
  sync(@Req() req: Request, @Body() dto: SyncBatchDto) {
    const device = req.user as any;
    return this.commandBus.execute(
      new SyncBatchCommand(
        device.tenantId,
        device.deviceId,
        dto.factoryId,
        dto.records,
        dto.batchId,
      ),
    );
  }
}
