import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LeaveController } from './infrastructure/http/leave.controller';
import { SubmitLeaveHandler } from './application/commands/submit-leave.handler';
import { ApproveLeaveHandler } from './application/commands/approve-leave.handler';
import { RejectLeaveHandler } from './application/commands/reject-leave.handler';
import { GetLeaveRequestsHandler } from './application/queries/get-leave-requests.handler';
import { GetLeaveBalanceHandler } from './application/queries/get-leave-balance.handler';

const CommandHandlers = [
  SubmitLeaveHandler,
  ApproveLeaveHandler,
  RejectLeaveHandler,
];
const QueryHandlers = [GetLeaveRequestsHandler, GetLeaveBalanceHandler];

@Module({
  imports: [CqrsModule],
  controllers: [LeaveController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class LeaveModule {}
