import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('admin/stats')
  @Roles('admin')
  async getAdminStats() {
    return this.statsService.getAdminStats();
  }

  @Get('user/stats')
  async getUserStats(@Req() req: Request) {
    return this.statsService.getUserStats(req.user);
  }
}
