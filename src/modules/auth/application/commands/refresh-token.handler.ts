import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from './refresh-token.command';
import { TokenService } from '../../domain/token.service';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UnauthorizedException } from '../../../../common/exceptions/domain.exception';
import { ERROR_CODES } from '../../../../common/constants/error-codes.constant';
import { randomUUID } from 'crypto';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    let payload: Awaited<ReturnType<TokenService['verifyRefreshToken']>>;
    try {
      payload = await this.tokenService.verifyRefreshToken(
        command.refreshToken,
      );
    } catch {
      throw new UnauthorizedException(
        ERROR_CODES.AUTH_TOKEN_INVALID,
        'Invalid refresh token',
      );
    }

    const { sub: userId, familyId, token } = payload;

    const isFamilyRevoked = await this.tokenService.isFamilyRevoked(familyId);
    if (isFamilyRevoked) {
      throw new UnauthorizedException(
        ERROR_CODES.AUTH_TOKEN_REVOKED,
        'Token family revoked due to suspected reuse',
      );
    }

    const tokenData = await this.tokenService.getRefreshTokenData(token);
    if (!tokenData) {
      await this.tokenService.revokeFamily(familyId);
      throw new UnauthorizedException(
        ERROR_CODES.AUTH_TOKEN_REVOKED,
        'Refresh token reuse detected. Please login again.',
      );
    }

    await this.tokenService.revokeRefreshToken(token);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        ERROR_CODES.AUTH_ACCOUNT_INACTIVE,
        'Account inactive',
      );
    }

    const sessionId = randomUUID();
    const newFamilyId = randomUUID();

    const [accessToken, newRefreshToken] = await Promise.all([
      this.tokenService.issueAccessToken({
        id: user.id,
        tenantId: user.tenantId,
        role: user.role,
        sessionId,
      }),
      this.tokenService.issueRefreshToken(user.id, newFamilyId),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
