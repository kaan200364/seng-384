import { ActivityLog, MeetingRequest, Notification, Post, User } from '../generated/prisma/client';

type PublicUser = Omit<User, 'password' | 'updatedAt' | 'createdAt'> & {
  createdAt: string;
};

type PostWithAuthor = Post & { author: User };
type MeetingWithRelations = MeetingRequest & {
  requester: User;
  owner: User;
  post: Post & { author: User };
};

export function serializeUser(user: User): PublicUser {
  const { password, updatedAt, ...rest } = user;
  return {
    ...rest,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeNotification(notification: Notification) {
  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
  };
}

export function serializeLog(log: ActivityLog) {
  return {
    ...log,
    createdAt: log.createdAt.toISOString(),
  };
}

export function serializePost(post: PostWithAuthor) {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: serializeUser(post.author),
  };
}

export function serializeMeeting(meeting: MeetingWithRelations) {
  return {
    ...meeting,
    createdAt: meeting.createdAt.toISOString(),
    updatedAt: meeting.updatedAt.toISOString(),
    requester: serializeUser(meeting.requester),
    owner: serializeUser(meeting.owner),
    post: serializePost(meeting.post),
  };
}
