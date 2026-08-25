import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ComplianceController } from './infrastructure/http/compliance.controller';
import { AuditLogsHandler } from './application/queries/audit-logs.handler';
import { AnonymizeWorkerHandler } from './application/commands/anonymize-worker.handler';

@Module({
  imports: [CqrsModule],
  controllers: [ComplianceController],
  providers: [AuditLogsHandler, AnonymizeWorkerHandler],
})
export class ComplianceModule {}
