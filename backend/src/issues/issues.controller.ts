import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IssuesService } from './issues.service';
import { IssueInDto, ExtensionRequestDto, ExtensionDecisionDto } from './dto/issue.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post('issues')
  @Roles('admin')
  async create(@Body() data: IssueInDto) {
    return { success: true, data: await this.issuesService.issueBooks(data) };
  }

  @Get('issues')
  async findAll(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('roll_number') roll_number?: string,
  ) {
    return { success: true, data: await this.issuesService.findAll(req.user, status, roll_number) };
  }

  @Post('issues/:id/return')
  @Roles('admin')
  async returnBook(@Param('id') id: string) {
    return { success: true, data: await this.issuesService.returnBook(id) };
  }

  @Post('issues/:id/request-extension')
  async requestExtension(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() data: ExtensionRequestDto,
  ) {
    return { success: true, data: await this.issuesService.requestExtension(id, req.user, data) };
  }

  @Post('issues/:id/extension/decide')
  @Roles('admin')
  async decideExtension(
    @Param('id') id: string,
    @Body() data: ExtensionDecisionDto,
  ) {
    return { success: true, data: await this.issuesService.decideExtension(id, data) };
  }

  @Get('extension-requests')
  @Roles('admin')
  async listExtensions(@Query('status') status: string = 'pending') {
    const issues = await this.issuesService.findAll({ role: 'admin' }, undefined, undefined);
    const data = issues.filter(i => {
      if (!i.extension_request) return false;
      if (status === 'all') return true;
      return i.extension_request.status === status;
    });
    return { success: true, data };
  }

  @Get('extension-requests/pending-count')
  @Roles('admin')
  async pendingCount() {
    const issues = await this.issuesService.findAll({ role: 'admin' }, undefined, undefined);
    const count = issues.filter(i => i.extension_request?.status === 'pending').length;
    return { success: true, data: { count } };
  }
}
