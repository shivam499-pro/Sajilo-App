import { UserRole, UserStatus, UserLanguage } from './user';

export interface UserProfile {
  uid: string;
  phoneNumber: string;

  displayName?: string;
  email?: string;
  avatarUrl?: string;

  primaryRole: UserRole;
  status: UserStatus;

  language?: UserLanguage;

  profileCompletionScore?: number;
  isActive: boolean;
}
