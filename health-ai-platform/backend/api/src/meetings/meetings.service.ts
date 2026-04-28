import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MeetingRequestStatus,
  PostStatus,
  UserRole,
} from '../common/platform.types';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { PlatformStateService } from '../platform-state/platform-state.service';
import { PrismaService } from '../prisma/prisma.service';
import { serializeMeeting } from '../common/serializers';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly platformState: PlatformStateService,
  ) {}

  async createRequest(
    requesterId: number,
    body: {
      postId: number;
      message: string;
      ndaAccepted: boolean;
      proposedSlot: string;
    },
  ) {
    const requester = await this.usersService.findById(requesterId);
    const post = await this.postsService.getPostById(
      body.postId,
      requesterId,
      requester?.role,
    );

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    if (post.authorId === requesterId) {
      throw new BadRequestException(
        'You cannot request a meeting for your own post',
      );
    }

    if (post.status !== PostStatus.ACTIVE) {
      throw new BadRequestException(
        'Meetings can only be requested for active posts',
      );
    }

    if (post.confidentialityLevel === 'CONFIDENTIAL' && !body.ndaAccepted) {
      throw new BadRequestException(
        'You must accept the NDA for confidential posts',
      );
    }

    const request = await this.prisma.meetingRequest.create({
      data: {
        postId: body.postId,
        requesterId,
        ownerId: post.authorId,
        message: body.message,
        ndaAccepted: body.ndaAccepted,
        proposedSlot: body.proposedSlot,
      },
      include: {
        requester: true,
        owner: true,
        post: {
          include: {
            author: true,
          },
        },
      },
    });

    await this.platformState.addLog(
      requester,
      'meeting_request',
      'meeting',
      String(request.id),
      `Requested meeting for post "${post.title}"`,
    );
    await this.platformState.addNotification(
      post.authorId,
      'New meeting request',
      `${requester.fullName} requested a meeting for "${post.title}".`,
    );

    return serializeMeeting(request);
  }

  async getMyRequests(userId: number, role: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rows = await this.prisma.meetingRequest.findMany({
      where:
        role === UserRole.ADMIN
          ? undefined
          : {
              OR: [{ ownerId: userId }, { requesterId: userId }],
            },
      include: {
        requester: true,
        owner: true,
        post: {
          include: {
            author: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rows.map((item) => serializeMeeting(item));
  }

  async updateRequestStatus(
    userId: number,
    requestId: number,
    body: { status: MeetingRequestStatus },
  ) {
    const request = await this.prisma.meetingRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
        owner: true,
        post: {
          include: {
            author: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Meeting request not found');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOwner = request.ownerId === userId;
    const isRequester = request.requesterId === userId;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isOwner && !isRequester && !isAdmin) {
      throw new ForbiddenException('You cannot manage this meeting request');
    }

    const updated = await this.prisma.meetingRequest.update({
      where: { id: requestId },
      data: {
        status: body.status as any,
      },
      include: {
        requester: true,
        owner: true,
        post: {
          include: {
            author: true,
          },
        },
      },
    });

    if (body.status === MeetingRequestStatus.SCHEDULED) {
      await this.postsService.updatePostStatus(
        request.postId,
        request.ownerId,
        PostStatus.MEETING_SCHEDULED,
      );
      await this.platformState.addNotification(
        request.requesterId,
        'Meeting scheduled',
        `Your meeting request #${request.id} has been scheduled.`,
      );
    }

    await this.platformState.addLog(
      user,
      'meeting_status_change',
      'meeting',
      String(request.id),
      `Updated meeting request to ${body.status}`,
    );

    return serializeMeeting(updated);
  }
}
