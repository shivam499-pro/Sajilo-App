// services/userService.ts - Complete User Service for Firestore Operations

import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  calculateProfileCompletion,
  CreateUserData,
  DEFAULT_USER_VALUES,
  isValidNepaliPhone,
  UpdateUserData,
  User,
  UserStatus,
} from '../types/user';

/**
 * Collection reference
 */
const USERS_COLLECTION = 'users';

/**
 * Custom errors for better error handling
 */
export class UserServiceError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'ALREADY_EXISTS' | 'INVALID_DATA' | 'PERMISSION_DENIED' | 'NETWORK_ERROR',
    message: string
  ) {
    super(message);
    this.name = 'UserServiceError';
  }
}

/**
 * UserService - Handles all user-related Firestore operations
 */
class UserService {
  /**
   * CREATE: Initialize a new user profile in Firestore
   * Called after successful Firebase Auth OTP verification
   */
  async createUserProfile(data: CreateUserData): Promise<User> {
    try {
      // Validate phone number format
      if (!isValidNepaliPhone(data.phoneNumber)) {
        throw new UserServiceError(
          'INVALID_DATA',
          'Invalid Nepali phone number format. Must be +977XXXXXXXXXX'
        );
      }

      // Validate display name
      if (!data.displayName || data.displayName.trim().length < 2) {
        throw new UserServiceError(
          'INVALID_DATA',
          'Display name must be at least 2 characters'
        );
      }

      // Check if user already exists
      const exists = await this.userExists(data.uid);
      if (exists) {
        throw new UserServiceError(
          'ALREADY_EXISTS',
          'User profile already exists'
        );
      }

      // Construct user document
      const newUser: User = {
        uid: data.uid,
        phoneNumber: data.phoneNumber,
        displayName: data.displayName.trim(),
        ...DEFAULT_USER_VALUES,
        language: data.language || DEFAULT_USER_VALUES.language,
        metadata: data.metadata,
        createdAt: Timestamp.now(),
        lastActiveAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
      };

      // Calculate initial profile completion
      newUser.profileCompletionScore = calculateProfileCompletion(newUser);

      // Save to Firestore
      const userRef = doc(db, USERS_COLLECTION, data.uid);
      await setDoc(userRef, newUser);

      console.log('✅ User profile created:', data.uid);
      return newUser;
    } catch (error: any) {
      if (error instanceof UserServiceError) {
        throw error;
      }
      console.error('❌ Error creating user profile:', error);
      throw new UserServiceError('NETWORK_ERROR', error.message || 'Failed to create user profile');
    }
  }

  /**
   * READ: Get user profile by UID
   * Returns null if user doesn't exist
   */
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const userData = userSnap.data() as User;

      // Update last active timestamp (async, don't await)
      this.updateLastActive(uid).catch(err =>
        console.warn('Failed to update lastActive:', err)
      );

      return userData;
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error);
      throw new UserServiceError('NETWORK_ERROR', 'Failed to fetch user profile');
    }
  }

  /**
   * READ: Real-time listener for user profile changes
   * Returns unsubscribe function
   */
  subscribeToUserProfile(
    uid: string,
    onUpdate: (user: User | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const userRef = doc(db, USERS_COLLECTION, uid);

    return onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as User;
          onUpdate(userData);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.error('❌ Error in user profile listener:', error);
        if (onError) {
          onError(new UserServiceError('NETWORK_ERROR', 'Real-time sync failed'));
        }
      }
    );
  }

  /**
   * UPDATE: Update user profile with partial data
   */
  async updateUserProfile(uid: string, updates: UpdateUserData): Promise<void> {
    try {
      // Validate if user exists
      const exists = await this.userExists(uid);
      if (!exists) {
        throw new UserServiceError('NOT_FOUND', 'User profile not found');
      }

      const userRef = doc(db, USERS_COLLECTION, uid);

      // Add automatic timestamp
      const updateData: any = {
        ...updates,
        lastActiveAt: serverTimestamp(),
      };

      // Recalculate profile completion if relevant fields changed
      if (updates.displayName || updates.email || updates.avatarUrl) {
        const currentUser = await this.getUserProfile(uid);
        if (currentUser) {
          updateData.profileCompletionScore = calculateProfileCompletion({
            ...currentUser,
            ...updates,
          });
        }
      }

      await updateDoc(userRef, updateData);
      console.log('✅ User profile updated:', uid);
    } catch (error: any) {
      if (error instanceof UserServiceError) {
        throw error;
      }
      console.error('❌ Error updating user profile:', error);
      throw new UserServiceError('NETWORK_ERROR', 'Failed to update user profile');
    }
  }

  /**
   * UPDATE: Increment login count and update last login time
   * Called on each successful authentication
   */
  async recordLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        loginCount: increment(1),
        lastLoginAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      });
      console.log('✅ Login recorded for user:', uid);
    } catch (error: any) {
      // Don't throw - this is not critical
      console.warn('⚠️ Failed to record login:', error);
    }
  }

  /**
   * UPDATE: Update last active timestamp
   * Called periodically or on key actions
   */
  async updateLastActive(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        lastActiveAt: serverTimestamp(),
      });
    } catch (error: any) {
      // Silent fail - not critical
      console.warn('⚠️ Failed to update lastActive:', error);
    }
  }

  /**
   * UPDATE: Add device token for push notifications
   */
  async addDeviceToken(uid: string, token: string): Promise<void> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) {
        throw new UserServiceError('NOT_FOUND', 'User not found');
      }

      // Only add if not already present
      if (!user.deviceIds.includes(token)) {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(userRef, {
          deviceIds: [...user.deviceIds, token],
        });
        console.log('✅ Device token added:', uid);
      }
    } catch (error: any) {
      console.warn('⚠️ Failed to add device token:', error);
    }
  }

  /**
   * UPDATE: Remove device token (on logout or token refresh)
   */
  async removeDeviceToken(uid: string, token: string): Promise<void> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) return;

      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        deviceIds: user.deviceIds.filter(id => id !== token),
      });
      console.log('✅ Device token removed:', uid);
    } catch (error: any) {
      console.warn('⚠️ Failed to remove device token:', error);
    }
  }

  /**
   * UPDATE: Change user account status
   * Admin only in production
   */
  async updateUserStatus(
    uid: string,
    status: UserStatus,
    reason?: string
  ): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const updates: any = { status };

      if (reason) {
        updates.statusReason = reason;
      }

      await updateDoc(userRef, updates);
      console.log(`✅ User status updated to ${status}:`, uid);
    } catch (error: any) {
      console.error('❌ Error updating user status:', error);
      throw new UserServiceError('NETWORK_ERROR', 'Failed to update user status');
    }
  }

  /**
   * CHECK: Does user profile exist in Firestore?
   */
  async userExists(uid: string): Promise<boolean> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error: any) {
      console.error('❌ Error checking user existence:', error);
      return false;
    }
  }

  /**
   * DELETE: Soft delete user account
   * Sets status to 'deleted', keeps data for compliance
   */
  async deleteUserAccount(uid: string): Promise<void> {
    try {
      await this.updateUserStatus(uid, 'deleted', 'User requested deletion');
      console.log('✅ User account soft-deleted:', uid);
    } catch (error: any) {
      console.error('❌ Error deleting user account:', error);
      throw new UserServiceError('NETWORK_ERROR', 'Failed to delete user account');
    }
  }

  /**
   * DELETE: Hard delete user document (admin only, for testing)
   * WARNING: This permanently deletes data
   */
  async hardDeleteUser(uid: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await deleteDoc(userRef);
      console.log('⚠️ User permanently deleted:', uid);
    } catch (error: any) {
      console.error('❌ Error hard deleting user:', error);
      throw new UserServiceError('NETWORK_ERROR', 'Failed to delete user');
    }
  }

  /**
   * UTILITY: Check if user profile is complete enough for ordering
   */
  async isProfileReadyForOrders(uid: string): Promise<boolean> {
    const user = await this.getUserProfile(uid);
    if (!user) return false;

    // Minimum requirements: name, phone, active status
    return (
      user.status === 'active' &&
      !!user.displayName &&
      !!user.phoneNumber &&
      user.profileCompletionScore >= 30
    );
  }

  // ==================== ADDRESS MANAGEMENT ====================

  /**
   * GET: Get all addresses for a user
   */
  async getUserAddresses(uid: string): Promise<Address[]> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) {
        throw new UserServiceError('NOT_FOUND', 'User not found');
      }
      return user.addresses || [];
    } catch (error: any) {
      if (error instanceof UserServiceError) throw error;
      console.error('❌ Error fetching addresses:', error);
      throw new UserServiceError('NETWORK_ERROR', 'Failed to fetch addresses');
    }
  }

  /**
   * ADD: Add a new address for user
   */
  async addAddress(uid: string, address: Omit<Address, 'id'>): Promise<Address> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) {
        throw new UserServiceError('NOT_FOUND', 'User not found');
      }

      const newAddress: Address = {
        ...address,
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // If this is the first address or marked as default, update other addresses
      const currentAddresses = user.addresses || [];
      let updatedAddresses: Address[];

      if (newAddress.isDefault || currentAddresses.length === 0) {
        updatedAddresses = currentAddresses.map(addr => ({ ...addr, isDefault: false }));
        newAddress.isDefault = true;
      } else {
        updatedAddresses = [...currentAddresses];
      }

      updatedAddresses.push(newAddress);

      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, { addresses: updatedAddresses });

      console.log('✅ Address added:', newAddress.id);
      return newAddress;
    } catch (error: any) {
      if (error instanceof UserServiceError) throw error;
      console.error('❌ Error adding address:', error);
      throw new UserServiceError('NETWORK_ERROR', 'Failed to add address');
    }
  }

  /**
   * UPDATE: Update an existing address
   */
  async updateAddress(uid: string, addressId: string, updates: Partial<Address>): Promise<void> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) {
        throw new UserServiceError('NOT_FOUND', 'User not found');
      }

      const currentAddresses = user.addresses || [];
      const addressIndex = currentAddresses.findIndex(addr => addr.id === addressId);

      if (addressIndex === -1) {
        throw new UserServiceError('NOT_FOUND', 'Address not found');
      }

      let updatedAddresses = [...currentAddresses];

      // If setting as default, unset others
      if (updates.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
      }

      updatedAddresses[addressIndex] = {
        ...updatedAddresses[addressIndex],
        ...updates,
      };

      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, { addresses: updatedAddresses });

      console.log('✅ Address updated:', addressId);
    } catch (error: any) {
      if (error instanceof UserServiceError) throw error;
      console.error('❌ Error updating address:', error);
      throw new UserServiceError('NETWORK_ERROR', 'Failed to update address');
    }
  }

  /**
   * DELETE: Remove an address
   */
  async deleteAddress(uid: string, addressId: string): Promise<void> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) {
        throw new UserServiceError('NOT_FOUND', 'User not found');
      }

      const currentAddresses = user.addresses || [];
      const addressToDelete = currentAddresses.find(addr => addr.id === addressId);

      if (!addressToDelete) {
        throw new UserServiceError('NOT_FOUND', 'Address not found');
      }

      let updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);

      // If deleted address was default, set first remaining as default
      if (addressToDelete.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, { addresses: updatedAddresses });

      console.log('✅ Address deleted:', addressId);
    } catch (error: any) {
      if (error instanceof UserServiceError) throw error;
      console.error('❌ Error deleting address:', error);
      throw new UserServiceError('NETWORK_ERROR', 'Failed to delete address');
    }
  }

  /**
   * SET DEFAULT: Set an address as default
   */
  async setDefaultAddress(uid: string, addressId: string): Promise<void> {
    await this.updateAddress(uid, addressId, { isDefault: true });
  }

  /**
   * GET DEFAULT: Get user's default address
   */
  async getDefaultAddress(uid: string): Promise<Address | null> {
    const addresses = await this.getUserAddresses(uid);
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  }
}

// Address type for the service
export interface Address {
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

// Export singleton instance
export const userService = new UserService();

// Export class for testing
export default UserService;