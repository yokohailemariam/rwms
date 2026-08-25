import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LoginCommand } from '../../application/commands/login.command';
import { LogoutCommand } from '../../application/commands/logout.command';
import { RefreshTokenCommand } from '../../application/commands/refresh-token.command';
import { ChangePasswordCommand } from '../../application/commands/change-password.command';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../../common/types/jwt-payload.type';
import { Public } from '../../../../common/decorators/public.decorator';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.commandBus.execute(
      new LoginCommand(
        dto.email,
        dto.password,
        req.ip,
        req.headers['user-agent'],
      ),
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: RefreshTokenDto,
  ) {
    return this.commandBus.execute(
      new LogoutCommand(user.userId, user.sessionId, body.refreshToken),
    );
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.commandBus.execute(
      new ChangePasswordCommand(
        user.userId,
        dto.currentPassword,
        dto.newPassword,
      ),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }
}
