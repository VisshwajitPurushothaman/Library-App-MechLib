import { Controller, Post, Body, Res, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterIn, LoginIn } from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() data: RegisterIn, @Res({ passthrough: true }) res: Response) {
    return this.authService.register(data, res);
  }

  @Post('login')
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
}
