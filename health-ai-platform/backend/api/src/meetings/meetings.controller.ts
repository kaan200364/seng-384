import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeetingsService } from './meetings.service';
import { MeetingRequestStatus } from '../common/platform.types';

@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  getMyRequests(@Req() req: any) {
    return this.meetingsService.getMyRequests(req.user.userId, req.user.role);
  }

  @Post()
  createRequest(
    @Req() req: any,
    @Body()
    body: {
      postId: number;
      message: string;
      ndaAccepted: boolean;
      proposedSlot: string;
    },
  ) {
    return this.meetingsService.createRequest(req.user.userId, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: MeetingRequestStatus },
  ) {
    return this.meetingsService.updateRequestStatus(req.user.userId, id, body);
  }
}
