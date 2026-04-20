import { Controller, Post, Body, Res, UnauthorizedException, Get, UseGuards, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterIn, LoginIn } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() data: RegisterIn, @Res({ passthrough: true }) res: Response) {
    return this.authService.register(data, res);
  }

  @Post('login')
  async login(@Body() data: LoginIn, @Res({ passthrough: true }) res: Response) {
    // #region agent log
    fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H4_role_mismatch_rejects_student_login',location:'auth.controller.ts:17',message:'auth login request received',data:{role:data?.role,identifierPreview:data?.identifier?.slice?.(0,3),identifierLength:data?.identifier?.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const user = await this.authService.validateUser(data.identifier, data.password);
    if (!user) {
      // #region agent log
      fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H3_student_identifier_not_found_or_password_mismatch',location:'auth.controller.ts:20',message:'auth login rejected: invalid credentials',data:{reason:'validateUser returned null'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.role !== data.role) {
      // #region agent log
      fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H4_role_mismatch_rejects_student_login',location:'auth.controller.ts:24',message:'auth login rejected: role mismatch',data:{requestedRole:data?.role,actualRole:user?.role},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw new UnauthorizedException(`This account is not a ${data.role} account`);
    }
    // #region agent log
    fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H4_role_mismatch_rejects_student_login',location:'auth.controller.ts:27',message:'auth login accepted',data:{role:user?.role,userId:user?.id},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
