import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { KioskController } from './infrastructure/http/kiosk.controller';
import { RegisterKioskHandler } from './application/commands/register-kiosk.handler';
import { ApproveKioskHandler } from './application/commands/approve-kiosk.handler';
import { SyncBatchHandler } from './application/commands/sync-batch.handler';
import { GetKioskConfigHandler } from './application/queries/get-kiosk-config.handler';
import { DeviceJwtStrategy } from './infrastructure/strategies/device-jwt.strategy';

const CommandHandlers = [
  RegisterKioskHandler,
  ApproveKioskHandler,
  SyncBatchHandler,
];
const QueryHandlers = [GetKioskConfigHandler];

@Module({
  imports: [CqrsModule, PassportModule, AuthModule],
  controllers: [KioskController],
  providers: [...CommandHandlers, ...QueryHandlers, DeviceJwtStrategy],
})
export class KioskModule {}
