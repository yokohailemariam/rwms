import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TenantController } from './infrastructure/http/tenant.controller';
import { CreateTenantHandler } from './application/commands/create-tenant.handler';
import { GetTenantHandler } from './application/queries/get-tenant.handler';

const CommandHandlers = [CreateTenantHandler];
const QueryHandlers = [GetTenantHandler];

@Module({
  imports: [CqrsModule],
  controllers: [TenantController],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [],
})
export class TenancyModule {}
