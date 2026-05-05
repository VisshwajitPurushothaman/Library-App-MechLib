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
    console.log(`[AuthDebug] Attempting login for: "${identifier}"`);
    const user = await this.usersService.findOneByIdentifier(identifier);
    
    if (!user) {
      console.log(`[AuthDebug] User NOT found in database for identifier: "${identifier}"`);
      throw new UnauthorizedException('The account identifier (email/roll number) provided was not found.');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      console.log(`[AuthDebug] Password MISMATCH for user: "${identifier}"`);
      throw new UnauthorizedException('The password you entered is incorrect. Please try again.');
    }

    console.log(`[AuthDebug] Login SUCCESS for user: "${identifier}" (Role: ${user.role})`);
    return user;
  }

  async login(user: any, response: Response) {
    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours (secure)
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
      password: userData.password, // Corrected from password_hash to password
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

  async changePassword(userId: string, data: any) {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new UnauthorizedException('User not found.');

    const isMatch = await bcrypt.compare(data.current_password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const new_password_hash = await bcrypt.hash(data.new_password, 10);
    await this.usersService.update(userId, { password_hash: new_password_hash });

    return { success: true, data: { message: 'Password updated successfully' } };
  }
}
