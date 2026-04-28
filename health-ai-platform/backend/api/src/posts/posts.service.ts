import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostStatus, UserRole } from '../common/platform.types';
import { UsersService } from '../users/users.service';
import { PlatformStateService } from '../platform-state/platform-state.service';
import { PrismaService } from '../prisma/prisma.service';
import { serializePost } from '../common/serializers';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly platformState: PlatformStateService,
  ) {}

  async createPost(data: {
    title: string;
    domain: string;
    requiredExpertise: string;
    projectStage: string;
    confidentialityLevel: 'PUBLIC' | 'CONFIDENTIAL';
    city: string;
    description: string;
    authorId: number;
    status: PostStatus;
  }) {
    const post = await this.prisma.post.create({
      data: {
        title: data.title,
        domain: data.domain,
        requiredExpertise: data.requiredExpertise,
        projectStage: data.projectStage,
        confidentialityLevel: data.confidentialityLevel as any,
        city: data.city,
        description: data.description,
        authorId: data.authorId,
        status: data.status as any,
      },
      include: {
        author: true,
      },
    });

    const author = await this.usersService.findById(data.authorId);
    if (author) {
      await this.platformState.addLog(
        author,
        'post_create',
        'post',
        String(post.id),
        `Created post "${post.title}"`,
      );
    }

    return serializePost(post);
  }

  async getAllPosts(filters?: {
    query?: string;
    domain?: string;
    city?: string;
    status?: string;
    requiredExpertise?: string;
    currentUserId?: number;
    currentUserRole?: string;
  }) {
    const posts = await this.prisma.post.findMany({
      where: {
        domain:
          filters?.domain && filters.domain !== 'ALL' ? filters.domain : undefined,
        city: filters?.city && filters.city !== 'ALL' ? filters.city : undefined,
        status:
          filters?.status && filters.status !== 'ALL'
            ? (filters.status as any)
            : undefined,
        requiredExpertise:
          filters?.requiredExpertise && filters.requiredExpertise !== 'ALL'
            ? filters.requiredExpertise
            : undefined,
        OR: filters?.query
          ? [
              { title: { contains: filters.query, mode: 'insensitive' } },
              { description: { contains: filters.query, mode: 'insensitive' } },
              { domain: { contains: filters.query, mode: 'insensitive' } },
              {
                requiredExpertise: {
                  contains: filters.query,
                  mode: 'insensitive',
                },
              },
            ]
          : undefined,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts
      .filter((post) => {
        const isOwner = filters?.currentUserId === post.authorId;
        const isAdmin = filters?.currentUserRole === UserRole.ADMIN;

        if (post.status === PostStatus.DRAFT && !isOwner && !isAdmin) {
          return false;
        }

        return true;
      })
      .map((post) => serializePost(post));
  }

  async getPostById(
    postId: number,
    currentUserId?: number,
    currentUserRole?: string,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (
      post.status === PostStatus.DRAFT &&
      currentUserId !== post.authorId &&
      currentUserRole !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You do not have access to this draft post');
    }

    return serializePost(post);
  }

  async deletePost(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    const user = await this.usersService.findById(userId);
    if (user) {
      await this.platformState.addLog(
        user,
        'post_delete',
        'post',
        String(postId),
        `Deleted post "${post.title}"`,
      );
    }

    return { message: 'Post deleted successfully' };
  }

  async updatePost(
    postId: number,
    userId: number,
    data: {
      title: string;
      domain: string;
      requiredExpertise: string;
      projectStage: string;
      confidentialityLevel: 'PUBLIC' | 'CONFIDENTIAL';
      city: string;
      description: string;
      status?: PostStatus;
    },
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        domain: data.domain,
        requiredExpertise: data.requiredExpertise,
        projectStage: data.projectStage,
        confidentialityLevel: data.confidentialityLevel as any,
        city: data.city,
        description: data.description,
        status: (data.status as any) ?? undefined,
      },
      include: {
        author: true,
      },
    });

    const user = await this.usersService.findById(userId);
    if (user) {
      await this.platformState.addLog(
        user,
        'post_update',
        'post',
        String(postId),
        `Updated post "${updated.title}"`,
      );
    }

    return serializePost(updated);
  }

  async updatePostStatus(postId: number, userId: number, status: PostStatus) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        'You can only change the status of your own posts',
      );
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: status as any,
      },
      include: {
        author: true,
      },
    });

    const user = await this.usersService.findById(userId);
    if (user) {
      await this.platformState.addLog(
        user,
        'post_status_change',
        'post',
        String(postId),
        `Changed post status to ${status}`,
      );
    }

    return serializePost(updated);
  }

  async adminDeletePost(postId: number, adminUserId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    const admin = await this.usersService.findById(adminUserId);
    if (admin) {
      await this.platformState.addLog(
        admin,
        'admin_remove_post',
        'post',
        String(postId),
        `Removed post "${post.title}"`,
      );
    }

    return { message: 'Post removed by admin' };
  }
}
