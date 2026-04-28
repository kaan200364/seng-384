import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PlatformUser, PublicUser, UserRole } from '../common/platform.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  serializeLog,
  serializeMeeting,
  serializeNotification,
  serializePost,
  serializeUser,
} from '../common/serializers';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    institution?: string;
    expertise?: string;
    city?: string;
    bio?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: {
        email: data.email.toLowerCase(),
      },
    });

    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: data.password,
        fullName: data.fullName,
        role: data.role as any,
        institution: data.institution ?? 'Not provided',
        expertise: data.expertise ?? 'Not provided',
        city: data.city ?? 'Not provided',
        bio: data.bio ?? '',
      },
    });

    return serializeUser(user) as PublicUser;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    return user ? this.toPlatformUser(user) : undefined;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: {
        suspended: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return users.map((user) => serializeUser(user)) as PublicUser[];
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toPlatformUser(user) : undefined;
  }

  async getPublicUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return serializeUser(user) as PublicUser;
  }

  async verifyEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
      },
    });

    return {
      message: 'Email verified successfully',
      user: serializeUser(updated) as PublicUser,
    };
  }

  async updateProfile(
    userId: number,
    data: {
      fullName?: string;
      institution?: string;
      expertise?: string;
      city?: string;
      bio?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName ?? user.fullName,
        institution: data.institution ?? user.institution,
        expertise: data.expertise ?? user.expertise,
        city: data.city ?? user.city,
        bio: data.bio ?? user.bio,
      },
    });

    return serializeUser(updated) as PublicUser;
  }

  async exportUserData(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        requestedMeetings: {
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
        },
        ownedMeetings: {
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
        },
        notifications: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        activityLogs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      exportedAt: new Date().toISOString(),
      user: serializeUser(user) as PublicUser,
      posts: user.posts.map((post) => serializePost(post)),
      requestedMeetings: user.requestedMeetings.map((meeting) =>
        serializeMeeting(meeting),
      ),
      ownedMeetings: user.ownedMeetings.map((meeting) =>
        serializeMeeting(meeting),
      ),
      notifications: user.notifications.map((notification) =>
        serializeNotification(notification),
      ),
      activityLogs: user.activityLogs.map((log) => serializeLog(log)),
    };
  }

  async suspendUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { suspended: true },
    });

    return serializeUser(updated) as PublicUser;
  }

  async deleteUser(userId: number, currentPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }

  private toPlatformUser(user: {
    id: number;
    email: string;
    password: string;
    fullName: string;
    role: any;
    institution: string;
    expertise: string;
    city: string;
    bio: string;
    emailVerified: boolean;
    suspended: boolean;
    createdAt: Date;
  }): PlatformUser {
    return {
      ...user,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
