import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('admin')
  @Roles('admin')
  async getAdminStats() {
    return { success: true, data: await this.statsService.getAdminStats() };
  }

  @Get('reports')
  @Roles('admin')
  async getAdminReports() {
    return { success: true, data: await this.statsService.getReportStats() };
  }

  @Get('user')
  async getUserStats(@Req() req: Request) {
    return { success: true, data: await this.statsService.getUserStats(req.user) };
  }
}
