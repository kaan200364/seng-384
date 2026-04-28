export enum UserRole {
  ENGINEER = 'ENGINEER',
  HEALTHCARE_PROFESSIONAL = 'HEALTHCARE_PROFESSIONAL',
  ADMIN = 'ADMIN',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  PARTNER_FOUND = 'PARTNER_FOUND',
  EXPIRED = 'EXPIRED',
}

export enum MeetingRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export type PlatformUser = {
  id: number;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  institution: string;
  expertise: string;
  city: string;
  bio: string;
  emailVerified: boolean;
  suspended: boolean;
  createdAt: string;
};

export type PublicUser = Omit<PlatformUser, 'password'>;

export type PlatformPost = {
  id: number;
  title: string;
  domain: string;
  requiredExpertise: string;
  projectStage: string;
  confidentialityLevel: 'PUBLIC' | 'CONFIDENTIAL';
  city: string;
  description: string;
  status: PostStatus;
  authorId: number;
  createdAt: string;
  updatedAt: string;
};

export type MeetingRequest = {
  id: number;
  postId: number;
  requesterId: number;
  ownerId: number;
  message: string;
  ndaAccepted: boolean;
  proposedSlot: string;
  status: MeetingRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  id: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  actionType: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
};

export type NotificationItem = {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};
