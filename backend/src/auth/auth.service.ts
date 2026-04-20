import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByIdentifier(identifier);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      return user;
    }
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

    return {
      success: true,
      token,
      user,
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
}
