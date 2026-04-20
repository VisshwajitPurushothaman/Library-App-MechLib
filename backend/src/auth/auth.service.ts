import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { sanitizeUser } from '../users/utils/sanitize-user';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByIdentifier(identifier);
    // #region agent log
    fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H3_student_identifier_not_found_or_password_mismatch',location:'auth.service.ts:19',message:'validateUser lookup result',data:{identifierPreview:identifier?.slice?.(0,3),identifierLength:identifier?.length,userFound:!!user,userRole:user?.role},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      // #region agent log
      fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H3_student_identifier_not_found_or_password_mismatch',location:'auth.service.ts:21',message:'validateUser password matched',data:{matched:true,userRole:user?.role},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return user;
    }
    // #region agent log
    fetch('http://127.0.0.1:7373/ingest/3723e0ba-5dee-4e9f-86c6-0a0d4ab428e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11865b'},body:JSON.stringify({sessionId:'11865b',runId:'pre-fix',hypothesisId:'H3_student_identifier_not_found_or_password_mismatch',location:'auth.service.ts:24',message:'validateUser failed',data:{userFound:!!user,passwordMatch:false},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return null;
  }

  async login(user: any, response: Response) {
    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Enforce strict DTO pipeline
    const sanitizedUser = plainToInstance(UserResponseDto, sanitizeUser(user), {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      data: {
        token,
        user: sanitizedUser,
      },
    };
  }

  async register(userData: any, response: Response) {
    const user = await this.usersService.create({
      roll_number: userData.roll_number,
      name: userData.name,
      email: userData.email,
      password_hash: userData.password, // UsersService will hash it
      role: userData.role || 'user',
    });

    return this.login(user, response);
  }

  async getMe(user: any) {
    const sanitizedUser = plainToInstance(UserResponseDto, sanitizeUser(user), {
      excludeExtraneousValues: true,
    });

    return {
      success: true,
      data: sanitizedUser,
    };
  }
}
