import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EmergencyController } from './infrastructure/http/emergency.controller';
import { ReportIncidentHandler } from './application/commands/report-incident.handler';
import { ResolveIncidentHandler } from './application/commands/resolve-incident.handler';
import { ListIncidentsHandler } from './application/queries/list-incidents.handler';
import { OutboxModule } from '../../infrastructure/outbox/outbox.module';

const CommandHandlers = [ReportIncidentHandler, ResolveIncidentHandler];
const QueryHandlers = [ListIncidentsHandler];

@Module({
  imports: [CqrsModule, OutboxModule],
  controllers: [EmergencyController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class EmergencyModule {}
