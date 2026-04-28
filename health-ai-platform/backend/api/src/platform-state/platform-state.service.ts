import { Injectable } from '@nestjs/common';
import { ActivityLog, NotificationItem, PlatformUser } from '../common/platform.types';

@Injectable()
export class PlatformStateService {
  private nextLogId = 1;
  private nextNotificationId = 1;
  private logs: ActivityLog[] = [];
  private notifications: NotificationItem[] = [];

  addLog(user: PlatformUser, actionType: string, targetType: string, targetId: string, details: string) {
    this.logs.unshift({
      id: this.nextLogId++,
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      actionType,
      targetType,
      targetId,
      details,
      createdAt: new Date().toISOString(),
    });
  }

  getLogs(filters?: { actionType?: string; role?: string }) {
    return this.logs.filter((log) => {
      if (filters?.actionType && filters.actionType !== 'ALL' && log.actionType !== filters.actionType) {
        return false;
      }

      if (filters?.role && filters.role !== 'ALL' && log.userRole !== filters.role) {
        return false;
      }

      return true;
    });
  }

  exportLogsCsv(filters?: { actionType?: string; role?: string }) {
    const rows = this.getLogs(filters);
    const header = 'id,createdAt,userName,userRole,actionType,targetType,targetId,details';
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

  addNotification(userId: number, title: string, message: string) {
    this.notifications.unshift({
      id: this.nextNotificationId++,
      userId,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  getNotificationsForUser(userId: number) {
    return this.notifications.filter((item) => item.userId === userId);
  }

  markAllNotificationsAsRead(userId: number) {
    this.notifications = this.notifications.map((item) =>
      item.userId === userId ? { ...item, read: true } : item,
    );
    return this.getNotificationsForUser(userId);
  }

  private escapeCsv(value: string) {
    return `"${value.replace(/"/g, '""')}"`;
  }
}
