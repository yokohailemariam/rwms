import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './infrastructure/http/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { TokenService } from './domain/token.service';
import { OtpService } from './domain/otp.service';
import { LoginHandler } from './application/commands/login.handler';
import { LogoutHandler } from './application/commands/logout.handler';
import { RefreshTokenHandler } from './application/commands/refresh-token.handler';
import { ChangePasswordHandler } from './application/commands/change-password.handler';

const CommandHandlers = [
  LoginHandler,
  LogoutHandler,
  RefreshTokenHandler,
  ChangePasswordHandler,
];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get('jwt.accessSecret') || 'change-me-access-secret',
        signOptions: {
          expiresIn: configService.get('jwt.accessExpiresIn') || '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [...CommandHandlers, TokenService, OtpService, JwtStrategy],
  exports: [TokenService, JwtModule, PassportModule],
})
export class AuthModule {}
