import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlatformStateService } from '../platform-state/platform-state.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly platformState: PlatformStateService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMyProfile(@Req() req: any) {
    return this.usersService.getPublicUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/notifications')
  getMyNotifications(@Req() req: any) {
    return this.platformState.getNotificationsForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/export')
  async exportMyData(@Req() req: any) {
    return this.usersService.exportUserData(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/notifications/read')
  markNotificationsRead(@Req() req: any) {
    return this.platformState.markAllNotificationsAsRead(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  async updateMyProfile(
    @Req() req: any,
    @Body()
    body: {
      fullName?: string;
      institution?: string;
      expertise?: string;
      city?: string;
      bio?: string;
    },
  ) {
    return this.usersService.updateProfile(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMyAccount(
    @Req() req: any,
    @Body() body: { password: string },
  ) {
    return this.usersService.deleteUser(req.user.userId, body.password);
  }
}
