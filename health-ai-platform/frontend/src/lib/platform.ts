export type UserRole = 'ENGINEER' | 'HEALTHCARE_PROFESSIONAL' | 'ADMIN';

export type PostStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'MEETING_SCHEDULED'
  | 'PARTNER_FOUND'
  | 'EXPIRED';

export type MeetingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'SCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED';

export type UserProfile = {
  id: number;
  email: string;
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

export type PostItem = {
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
  author: UserProfile;
};

export type NotificationItem = {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type MeetingItem = {
  id: number;
  postId: number;
  requesterId: number;
  ownerId: number;
  message: string;
  ndaAccepted: boolean;
  proposedSlot: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
  requester: UserProfile;
  owner: UserProfile;
  post: PostItem;
};

export const ROLE_OPTIONS: UserRole[] = ['ENGINEER', 'HEALTHCARE_PROFESSIONAL', 'ADMIN'];
