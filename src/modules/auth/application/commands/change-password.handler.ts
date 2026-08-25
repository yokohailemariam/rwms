import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from './change-password.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  hashPassword,
  verifyPassword,
} from '../../../../common/utils/hash.util';
import {
  UnauthorizedException,
  NotFoundException,
} from '../../../../common/exceptions/domain.exception';
import { ERROR_CODES } from '../../../../common/constants/error-codes.constant';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: command.userId },
    });
    if (!user) {
      throw new NotFoundException(ERROR_CODES.NOT_FOUND, 'User not found');
    }

    const isCurrentValid = await verifyPassword(
      user.passwordHash,
      command.currentPassword,
    );
    if (!isCurrentValid) {
      throw new UnauthorizedException(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        'Current password is incorrect',
      );
    }

    const newHash = await hashPassword(command.newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });
  }
}
