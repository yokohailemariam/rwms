import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../common/constants/queue-names.constant';
import { AttendanceController } from './infrastructure/http/attendance.controller';
import { ClockInHandler } from './application/commands/clock-in.handler';
import { ClockOutHandler } from './application/commands/clock-out.handler';
import { CorrectAttendanceHandler } from './application/commands/correct-attendance.handler';
import { GetWorkerAttendanceHandler } from './application/queries/get-worker-attendance.handler';
import { GetDailyAttendanceHandler } from './application/queries/get-daily-attendance.handler';
import { DuplicateDetectionService } from './domain/duplicate-detection.service';
import { OvertimeService } from './domain/overtime.service';
import { AttendanceProcessor } from './attendance.processor';

const CommandHandlers = [
  ClockInHandler,
  ClockOutHandler,
  CorrectAttendanceHandler,
];
const QueryHandlers = [GetWorkerAttendanceHandler, GetDailyAttendanceHandler];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.ATTENDANCE }),
  ],
  controllers: [AttendanceController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    DuplicateDetectionService,
    OvertimeService,
    AttendanceProcessor,
  ],
})
export class AttendanceModule {}
