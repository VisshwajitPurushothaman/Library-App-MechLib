import { Controller, Post, Body, Res, UnauthorizedException, Get, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterIn, LoginIn } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
  async register(@Body() data: RegisterIn, @Res({ passthrough: true }) res: Response) {
    return this.authService.register(data, res);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  async login(@Body() data: LoginIn, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(data.identifier, data.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.role !== data.role) {
      throw new UnauthorizedException(`This account is not a ${data.role} account`);
    }
    return this.authService.login(user, res);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { success: true, data: { message: 'Logged out' } };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    return this.authService.getMe(req.user);
  }
}
