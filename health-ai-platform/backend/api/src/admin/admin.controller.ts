import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';
import { PlatformStateService } from '../platform-state/platform-state.service';
import { UserRole } from '../common/platform.types';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly platformState: PlatformStateService,
  ) {}

  @Get('users')
  async getUsers(@Req() req: any, @Query('role') role?: string) {
    this.assertAdmin(req.user.role);
    const users = await this.usersService.findAll();
    if (!role || role === 'ALL') {
      return users;
    }

    return users.filter((user) => user.role === role);
  }

  @Patch('users/:id/suspend')
  async suspendUser(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertAdmin(req.user.role);
    const admin = await this.usersService.findById(req.user.userId);
    const user = await this.usersService.suspendUser(id);

    if (admin) {
      await this.platformState.addLog(
        admin,
        'admin_suspend_user',
        'user',
        String(id),
        `Suspended user ${user.email}`,
      );
    }

    return user;
  }

  @Get('posts')
  async getPosts(@Req() req: any, @Query('status') status?: string) {
    this.assertAdmin(req.user.role);
    return this.postsService.getAllPosts({
      status,
      currentUserId: req.user.userId,
      currentUserRole: req.user.role,
    });
  }

  @Delete('posts/:id')
  async removePost(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertAdmin(req.user.role);
    return this.postsService.adminDeletePost(id, req.user.userId);
  }

  @Get('logs')
  getLogs(
    @Req() req: any,
    @Query('actionType') actionType?: string,
    @Query('role') role?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    this.assertAdmin(req.user.role);
    return this.platformState.getLogs({ actionType, role, dateFrom, dateTo });
  }

  @Get('logs/export')
  async exportLogs(
    @Req() req: any,
    @Res() res: Response,
    @Query('actionType') actionType?: string,
    @Query('role') role?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    this.assertAdmin(req.user.role);
    const csv = await this.platformState.exportLogsCsv({
      actionType,
      role,
      dateFrom,
      dateTo,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="activity-logs.csv"',
    );
    res.send(csv);
  }

  private assertAdmin(role: string) {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }
}
