import { Injectable } from '@nestjs/common';
import {
  ActivityLog,
  NotificationItem,
  PlatformUser,
} from '../common/platform.types';
import { PrismaService } from '../prisma/prisma.service';
import { serializeLog, serializeNotification } from '../common/serializers';

@Injectable()
export class PlatformStateService {
  constructor(private readonly prisma: PrismaService) {}

  async addLog(
    user: PlatformUser,
    actionType: string,
    targetType: string,
    targetId: string,
    details: string,
  ) {
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        actionType,
        targetType,
        targetId,
        details,
      },
    });
  }

  async getLogs(filters?: {
    actionType?: string;
    role?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const createdAt =
      filters?.dateFrom || filters?.dateTo
        ? {
            gte: filters.dateFrom
              ? new Date(`${filters.dateFrom}T00:00:00.000Z`)
              : undefined,
            lte: filters.dateTo
              ? new Date(`${filters.dateTo}T23:59:59.999Z`)
              : undefined,
          }
        : undefined;

    const logs = await this.prisma.activityLog.findMany({
      where: {
        actionType:
          filters?.actionType && filters.actionType !== 'ALL'
            ? filters.actionType
            : undefined,
        userRole:
          filters?.role && filters.role !== 'ALL' ? (filters.role as any) : undefined,
        createdAt,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return logs.map((log) => serializeLog(log)) as ActivityLog[];
  }

  async getLogsForUser(userId: number) {
    const logs = await this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return logs.map((log) => serializeLog(log)) as ActivityLog[];
  }

  async exportLogsCsv(filters?: {
    actionType?: string;
    role?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const rows = await this.getLogs(filters);
    const header =
      'id,createdAt,userName,userRole,actionType,targetType,targetId,details';
    const data = rows.map((row) =>
      [
        row.id,
        row.createdAt,
        this.escapeCsv(row.userName),
        row.userRole,
        row.actionType,
        row.targetType,
        row.targetId,
        this.escapeCsv(row.details),
      ].join(','),
    );

    return [header, ...data].join('\n');
  }

  async addNotification(userId: number, title: string, message: string) {
    await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  }

  async getNotificationsForUser(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((notification) =>
      serializeNotification(notification),
    ) as NotificationItem[];
  }

  async markAllNotificationsAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });

    return this.getNotificationsForUser(userId);
  }

  private escapeCsv(value: string) {
    return `"${value.replace(/"/g, '""')}"`;
  }
}
