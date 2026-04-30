import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return { success: true, data: await this.usersService.create(createUserDto) };
  }

  @Get()
  @Roles('admin')
  async findAll(@Query('q') q?: string) {
    return { success: true, data: await this.usersService.findAll(q) };
  }

  @Get('by-roll/:roll')
  async findByRoll(@Param('roll') roll: string) {
    const user = await this.usersService.findOneByIdentifier(roll);
    if (!user) throw new Error('User not found');
    return { success: true, data: user };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string, @Req() req: any) {
    return { success: true, data: await this.usersService.remove(id, req.user?.id) };
  }
}
