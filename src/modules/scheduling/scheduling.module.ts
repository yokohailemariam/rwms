import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SchedulingController } from './infrastructure/http/scheduling.controller';
import { CreateShiftHandler } from './application/commands/create-shift.handler';
import { AssignShiftHandler } from './application/commands/assign-shift.handler';
import { GetRosterHandler } from './application/queries/get-roster.handler';

const CommandHandlers = [CreateShiftHandler, AssignShiftHandler];
const QueryHandlers = [GetRosterHandler];

@Module({
  imports: [CqrsModule],
  controllers: [SchedulingController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class SchedulingModule {}
