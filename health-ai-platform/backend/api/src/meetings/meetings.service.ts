import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MeetingRequest,
  MeetingRequestStatus,
  PostStatus,
  UserRole,
} from '../common/platform.types';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class MeetingsService {
  private nextId = 1;
  private requests: MeetingRequest[] = [];

  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly platformState: PlatformStateService,
  ) {}

  async createRequest(
    requesterId: number,
    body: { postId: number; message: string; ndaAccepted: boolean; proposedSlot: string },
  ) {
    const requester = await this.usersService.findById(requesterId);
    const post = await this.postsService.getPostById(body.postId, requesterId, requester?.role);

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    if (post.authorId === requesterId) {
      throw new BadRequestException('You cannot request a meeting for your own post');
    }

    if (post.status !== PostStatus.ACTIVE) {
      throw new BadRequestException('Meetings can only be requested for active posts');
    }

    if (post.confidentialityLevel === 'CONFIDENTIAL' && !body.ndaAccepted) {
      throw new BadRequestException('You must accept the NDA for confidential posts');
    }

    const request: MeetingRequest = {
      id: this.nextId++,
      postId: body.postId,
      requesterId,
      ownerId: post.authorId,
      message: body.message,
      ndaAccepted: body.ndaAccepted,
      proposedSlot: body.proposedSlot,
      status: MeetingRequestStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.requests.unshift(request);
    this.platformState.addLog(
      requester,
      'meeting_request',
      'meeting',
      String(request.id),
      `Requested meeting for post "${post.title}"`,
    );
    this.platformState.addNotification(
      post.authorId,
      'New meeting request',
      `${requester.fullName} requested a meeting for "${post.title}".`,
    );

    return this.enrichRequest(request);
  }

  async getMyRequests(userId: number, role: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rows = this.requests.filter((item) => {
      if (role === UserRole.ADMIN) {
        return true;
      }

      return item.ownerId === userId || item.requesterId === userId;
    });

    return Promise.all(rows.map((item) => this.enrichRequest(item)));
  }

  async updateRequestStatus(
    userId: number,
    requestId: number,
    body: { status: MeetingRequestStatus },
  ) {
    const request = this.requests.find((item) => item.id === requestId);
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

    request.status = body.status;
    request.updatedAt = new Date().toISOString();

    if (body.status === MeetingRequestStatus.SCHEDULED) {
      await this.postsService.updatePostStatus(request.postId, request.ownerId, PostStatus.MEETING_SCHEDULED);
      this.platformState.addNotification(
        request.requesterId,
        'Meeting scheduled',
        `Your meeting request #${request.id} has been scheduled.`,
      );
    }

    this.platformState.addLog(
      user,
      'meeting_status_change',
      'meeting',
      String(request.id),
      `Updated meeting request to ${body.status}`,
    );

    return this.enrichRequest(request);
  }

  private async enrichRequest(request: MeetingRequest) {
    const requester = await this.usersService.getPublicUserById(request.requesterId);
    const owner = await this.usersService.getPublicUserById(request.ownerId);
    const post = await this.postsService.getPostById(request.postId, owner.id, owner.role);

    return {
      ...request,
      requester,
      owner,
      post,
    };
  }
}
