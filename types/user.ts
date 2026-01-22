// types/user.ts - Complete User Data Model for Sajilo Delivery

import { Timestamp } from 'firebase/firestore';

/**
 * User Roles in the System
 * Phase 4: Only 'customer' is active
 * Others are reserved for future phases
 */
export type UserRole = 'customer' | 'vendor' | 'rider' | 'admin';

/**
 * User Account Status
 */
export type UserStatus = 'active' | 'suspended' | 'blocked' | 'deleted';

/**
 * Language Preferences
 */
export type UserLanguage = 'en' | 'ne';

/**
 * App Source Platforms
 */
export type AppSource = 'android' | 'ios' | 'web';

/**
 * User Address - Delivery address
 */
export interface UserAddress {
  id: string;
  label: string; // Home, Work, Other
  fullAddress: string;
  landmark?: string;
  city: string;
  area: string;
  pincode?: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * User Metadata - App and device info
 */
export interface UserMetadata {
  source: AppSource;
  appVersion: string;
  referredBy?: string; // For future referral system
  deviceInfo?: {
    model?: string;
    os?: string;
    osVersion?: string;
  };
}

/**
 * Main User Interface - Represents a user document in Firestore
 * Collection: users/{userId}
 */
export interface User {
  // Core Identity
  uid: string; // Firebase Auth UID (same as document ID)
  phoneNumber: string; // E.164 format: +9779812345678
  phoneVerified: boolean; // Always true after OTP

  // Profile Information
  displayName: string; // User's full name
  email?: string; // Optional, for receipts and notifications
  avatarUrl?: string; // Profile picture URL from Cloud Storage

  // Role & Permissions
  primaryRole: UserRole; // Main role (currently only 'customer')
  roles: UserRole[]; // Array for multi-role support (future)

  // Account Status
  status: UserStatus; // Account health
  statusReason?: string; // Why suspended/blocked (admin only)

  // Preferences
  language: UserLanguage; // UI language preference

  // Activity Tracking
  createdAt: Timestamp; // Account creation time
  lastActiveAt: Timestamp; // Last app interaction
  lastLoginAt: Timestamp; // Last successful login
  loginCount: number; // Total number of logins

  // Location (Privacy-compliant)
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Timestamp;
  };

  // Device Management
  deviceIds: string[]; // FCM tokens for push notifications

  // Saved Addresses
  addresses?: UserAddress[]; // User's delivery addresses

  // Profile Completion
  profileCompletionScore: number; // 0-100 (100 = fully complete)

  // Data Management
  version: number; // Schema version for migrations
  metadata: UserMetadata; // App and device metadata
}

/**
 * Lightweight User Info - For display in lists, reviews, etc.
 * Denormalized data to avoid joins
 */
export interface UserDisplayInfo {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  phoneNumber?: string; // Optional, privacy-sensitive
}

/**
 * User Profile Creation Data - Required fields for new users
 */
export interface CreateUserData {
  uid: string;
  phoneNumber: string;
  displayName: string;
  language?: UserLanguage;
  metadata: UserMetadata;
}

/**
 * User Profile Update Data - Partial updates allowed
 */
export interface UpdateUserData {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  language?: UserLanguage;
  lastActiveAt?: Timestamp;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Timestamp;
  };
}

/**
 * User Session Info - For auth state management
 */
export interface UserSession {
  user: User;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  needsOnboarding: boolean;
}

/**
 * Default values for new user creation
 */
export const DEFAULT_USER_VALUES = {
  phoneVerified: true,
  primaryRole: 'customer' as UserRole,
  roles: ['customer'] as UserRole[],
  status: 'active' as UserStatus,
  language: 'ne' as UserLanguage,
  loginCount: 1,
  profileCompletionScore: 30, // After name + phone
  deviceIds: [],
  version: 1,
};

/**
 * Profile Completion Scoring
 * Helps track what info is missing
 */
export const PROFILE_COMPLETION_WEIGHTS = {
  phoneNumber: 20, // Required
  displayName: 20, // Required
  email: 15,
  avatarUrl: 15,
  savedAddress: 20, // At least one address
  paymentMethod: 10, // At least one payment method
};

/**
 * ===============================
 * FRONTEND AUTH USER (UI SAFE)
 * ===============================
 * Used in AuthContext, Cart, Checkout, Permissions (UI)
 * This is a frontend-friendly version of User that works with AuthContext
 */
export interface AppUserProfile {
  // Core Identity
  uid: string;
  phoneNumber: string;
  phoneVerified?: boolean;

  // Profile Information
  displayName?: string;
  name?: string; // Backward compatibility
  email?: string;
  avatarUrl?: string;
  photoURL?: string; // Backward compatibility

  // Role & Permissions
  primaryRole: UserRole;
  roles?: UserRole[];

  // Account Status
  status: UserStatus;
  statusReason?: string;

  // Preferences
  language?: UserLanguage;
  location?: { city: string; area: string };

  // Activity Tracking (optional for frontend)
  createdAt?: any;
  lastLogin?: any;
  lastActiveAt?: any;
  loginCount?: number;

  // Profile Completion
  profileCompletionScore?: number;

  // Device Management
  deviceIds?: string[];

  // Metadata
  version?: number;
  metadata?: {
    source?: AppSource;
    appVersion?: string;
  };

  // Legacy field for backward compatibility
  isActive?: boolean;
}

/**
 * Type guard to check if an object is a valid AppUserProfile
 */
export function isAppUserProfile(obj: any): obj is AppUserProfile {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.uid === 'string' &&
    typeof obj.phoneNumber === 'string' &&
    typeof obj.primaryRole === 'string' &&
    typeof obj.status === 'string'
  );
}

/**
 * Convert Firestore User to AppUserProfile
 */
export function toAppUserProfile(user: User): AppUserProfile {
  return {
    uid: user.uid,
    phoneNumber: user.phoneNumber,
    phoneVerified: user.phoneVerified,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    primaryRole: user.primaryRole,
    roles: user.roles,
    status: user.status,
    statusReason: user.statusReason,
    language: user.language,
    loginCount: user.loginCount,
    profileCompletionScore: user.profileCompletionScore,
    deviceIds: user.deviceIds,
    version: user.version,
    metadata: user.metadata,
    isActive: user.status === 'active',
  };
}

/**
 * Legacy UserProfile type - kept for backward compatibility
 * @deprecated Use AppUserProfile instead
 */
export interface UserProfile {
  uid: string;
  phoneNumber: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  status: UserStatus;
  permissions: string[];
}





/**
 * Utility type guards
 */
export const isActiveUser = (user: User): boolean => {
  return user.status === 'active';
};

export const isBlockedUser = (user: User): boolean => {
  return user.status === 'blocked' || user.status === 'suspended';
};

export const isCustomer = (user: User): boolean => {
  return user.primaryRole === 'customer';
};

export const isVendor = (user: User): boolean => {
  return user.primaryRole === 'vendor' || user.roles.includes('vendor');
};

export const isRider = (user: User): boolean => {
  return user.primaryRole === 'rider' || user.roles.includes('rider');
};

export const isAdmin = (user: User): boolean => {
  return user.primaryRole === 'admin' || user.roles.includes('admin');
};

/**
 * Calculate profile completion percentage
 */
export const calculateProfileCompletion = (user: Partial<User>): number => {
  let score = 0;

  if (user.phoneNumber) score += PROFILE_COMPLETION_WEIGHTS.phoneNumber;
  if (user.displayName) score += PROFILE_COMPLETION_WEIGHTS.displayName;
  if (user.email) score += PROFILE_COMPLETION_WEIGHTS.email;
  if (user.avatarUrl) score += PROFILE_COMPLETION_WEIGHTS.avatarUrl;
  // savedAddress and paymentMethod checked in separate services

  return Math.min(score, 100);
};

/**
 * Phone number validation for Nepal
 */
export const isValidNepaliPhone = (phone: string): boolean => {
  // Must match: +977 followed by 9 or 10 digits
  const nepaliPhoneRegex = /^\+977[0-9]{10}$/;
  return nepaliPhoneRegex.test(phone);
};

/**
 * Sanitize user data before displaying
 * Remove sensitive fields
 */
export const sanitizeUserForDisplay = (user: User): UserDisplayInfo => {
  return {
    uid: user.uid,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
};