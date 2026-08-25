import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkerController } from './infrastructure/http/worker.controller';
import { CreateWorkerHandler } from './application/commands/create-worker.handler';
import { UpdateWorkerHandler } from './application/commands/update-worker.handler';
import { DeactivateWorkerHandler } from './application/commands/deactivate-worker.handler';
import { GetWorkerHandler } from './application/queries/get-worker.handler';
import { ListWorkersHandler } from './application/queries/list-workers.handler';

const CommandHandlers = [
  CreateWorkerHandler,
  UpdateWorkerHandler,
  DeactivateWorkerHandler,
];
const QueryHandlers = [GetWorkerHandler, ListWorkersHandler];

@Module({
  imports: [CqrsModule],
  controllers: [WorkerController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class IdentityModule {}
