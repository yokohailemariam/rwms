import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { LoginCommand } from './login.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { TokenService } from '../../domain/token.service';
import { verifyPassword } from '../../../../common/utils/hash.util';
import {
  UnauthorizedException,
  ForbiddenException,
} from '../../../../common/exceptions/domain.exception';
import { ERROR_CODES } from '../../../../common/constants/error-codes.constant';
import { randomUUID } from 'crypto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginCommand) {
    const { email, password, ipAddress, userAgent, deviceId } = command;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        ERROR_CODES.AUTH_ACCOUNT_LOCKED,
        `Account is locked until ${user.lockedUntil.toISOString()}`,
      );
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        ERROR_CODES.AUTH_ACCOUNT_INACTIVE,
        'Account is inactive',
      );
    }

    const isValidPassword = await verifyPassword(user.passwordHash, password);

    if (!isValidPassword) {
      const newAttempts = user.failedLoginAttempts + 1;
      const lockUntil =
        newAttempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          ...(lockUntil ? { lockedUntil: lockUntil } : {}),
        },
      });

      throw new UnauthorizedException(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

    const sessionId = randomUUID();
    const familyId = randomUUID();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const session = await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        tenantId: user.tenantId,
        deviceId,
        ipAddress,
        userAgent,
        isActive: true,
        expiresAt: sessionExpiresAt,
      },
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.issueAccessToken({
        id: user.id,
        tenantId: user.tenantId,
        role: user.role,
        sessionId: session.id,
      }),
      this.tokenService.issueRefreshToken(user.id, familyId),
    ]);

    await this.prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.id,
        actorRole: user.role,
        action: 'AUTH_LOGIN',
        resourceType: 'User',
        resourceId: user.id,
        ipAddress,
        userAgent,
        metadata: { sessionId: session.id },
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
