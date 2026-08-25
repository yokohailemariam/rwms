import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { TokenService } from '../../domain/token.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    if (command.refreshToken) {
      try {
        const payload = await this.tokenService.verifyRefreshToken(
          command.refreshToken,
        );
        if (payload?.token) {
          await this.tokenService.revokeRefreshToken(payload.token);
        }
      } catch {
        // ignore
      }
    }

    await this.prisma.session.updateMany({
      where: { id: command.sessionId, userId: command.userId },
      data: { isActive: false },
    });
  }
}
