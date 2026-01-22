// context/AuthContext.tsx - ENHANCED VERSION (keeps your existing logic)
// ✅ Your test mode logic preserved
// ✅ Your AsyncStorage flow preserved  
// 🆕 Added Phase 4 user sync improvements

import { auth, db } from "@/config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  ConfirmationResult,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
  User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

// 🆕 PHASE 4: Import new types
import {
  UserRole,
  UserStatus
} from "@/types/user";

// ==================== CONFIGURATION ====================
const USE_TEST_MODE = true;
const TEST_OTP = "123456";
const TEST_PHONE_PREFIX = "+977";

// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
  FIRST_LAUNCH: "isFirstLaunch",
  ONBOARDING: "onboardingDone",
  LOGGED_IN: "isLoggedIn",
  LANGUAGE: "hasSelectedLanguage",
  LOCATION: "hasSelectedLocation",
  SELECTED_LANGUAGE: "selectedLanguage",
  SELECTED_LOCATION: "selectedLocation",
  USER_DATA: "userData",
  DEVICE_TOKEN: "deviceToken",
  TEST_PHONE: "testPhoneNumber",
  TEST_USER_ID: "testUserId",
} as const;

// ==================== ENHANCED TYPES ====================
// 🆕 PHASE 4: Enhanced user profile with more fields
// This type is compatible with both AuthContext and permissions system
type UserProfile = {
  uid: string;
  phoneNumber: string;
  phoneVerified?: boolean;
  displayName?: string;
  name?: string; // Keep for backward compatibility
  email?: string;
  photoURL?: string;
  avatarUrl?: string;
  language?: string;
  location?: { city: string; area: string };

  // 🆕 PHASE 4: Role & Status (required for permissions)
  primaryRole: UserRole; // Required for permissions
  roles?: UserRole[]; // Required for multi-role permissions
  status: UserStatus; // Required for permissions
  statusReason?: string;

  // 🆕 PHASE 4: Activity tracking
  createdAt?: any;
  lastLogin?: any;
  lastActiveAt?: any;
  loginCount?: number;

  // 🆕 PHASE 4: Profile completion
  profileCompletionScore?: number;

  // 🆕 PHASE 4: Device Management (required for permissions)
  deviceIds?: string[];

  // 🆕 PHASE 4: Metadata
  version?: number;
  metadata?: {
    source?: "android" | "ios" | "web";
    appVersion?: string;
  };

  isActive?: boolean; // Keep for backward compatibility
};

type AuthContextType = {
  // State
  isFirstLaunch: boolean;
  onboardingDone: boolean;
  isLoggedIn: boolean;
  hasSelectedLanguage: boolean;
  hasSelectedLocation: boolean;
  phoneNumber: string;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isTestMode: boolean;

  // 🆕 PHASE 4: Enhanced state
  isProfileComplete: boolean; // 🆕
  needsOnboarding: boolean; // 🆕

  // Actions
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
  setHasSelectedLanguage: (value: boolean) => Promise<void>;
  setHasSelectedLocation: (value: boolean) => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;

  // 🆕 PHASE 4: New actions
  recordActivity: () => Promise<void>; // 🆕 Update lastActiveAt
};

const AuthContext = createContext<AuthContextType | null>(null);

// ==================== PROVIDER ====================
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Core State (Your existing state)
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSelectedLanguage, setLanguage] = useState(false);
  const [hasSelectedLocation, setLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    initialize();

    // 🆕 PHASE 4: Enhanced auth state listener with retry logic
    if (!USE_TEST_MODE) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          await loadUserProfileWithRetry(firebaseUser.uid); // 🆕 With retry
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setUserProfile(null);
          setIsLoggedIn(false);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // ==================== INITIALIZE ====================
  const initialize = async () => {
    try {
      const [onboarding, firstLaunch, loggedIn, language, location] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
          AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH),
          AsyncStorage.getItem(STORAGE_KEYS.LOGGED_IN),
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.LOCATION),
        ]);

      if (firstLaunch === null) {
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, "false");
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }

      setOnboardingDone(onboarding === "true");
      setIsLoggedIn(loggedIn === "true");
      setLanguage(language === "true");
      setLocation(location === "true");

      if (USE_TEST_MODE && loggedIn === "true") {
        const testPhone = await AsyncStorage.getItem(STORAGE_KEYS.TEST_PHONE);
        if (testPhone) {
          setPhoneNumber(testPhone);
        }
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FIRESTORE HELPERS ====================

  // 🆕 PHASE 4: Enhanced with retry logic and account status check
  const loadUserProfileWithRetry = async (uid: string, retryCount = 0): Promise<void> => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;

        // 🆕 PHASE 4: Check account status
        if (profile.status === "blocked" || profile.status === "suspended") {
          console.warn("⚠️ Account is", profile.status);
          await logout(); // Force logout
          throw new Error(`Account ${profile.status}${profile.statusReason ? ': ' + profile.statusReason : ''}`);
        }

        if (profile.status === "deleted") {
          console.warn("⚠️ Account deleted");
          await logout();
          throw new Error("This account has been deleted");
        }

        setUserProfile(profile);

        // 🆕 PHASE 4: Update lastActiveAt silently
        updateDoc(doc(db, "users", uid), {
          lastActiveAt: serverTimestamp(),
        }).catch(err => console.warn("Failed to update lastActive:", err));

      } else {
        // User authenticated but no Firestore doc
        console.warn("⚠️ User exists in Auth but not in Firestore:", uid);
        setUserProfile(null);
      }
    } catch (error: any) {
      console.error("❌ Error loading user profile:", error);

      // 🆕 PHASE 4: Retry logic
      if (retryCount < 2) {
        console.log(`🔄 Retrying... (${retryCount + 1}/2)`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return loadUserProfileWithRetry(uid, retryCount + 1);
      }

      throw error;
    }
  };

  // Keep your original function for backward compatibility
  const loadUserProfile = async (uid: string) => {
    return loadUserProfileWithRetry(uid, 0);
  };

  // 🆕 PHASE 4: Enhanced user creation with more fields
  const createOrUpdateUserProfile = async (
    uid: string,
    phone: string,
    additionalData?: Partial<UserProfile>
  ) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      const isNewUser = !userDoc.exists();

      const userData: UserProfile = {
        uid,
        phoneNumber: phone,
        phoneVerified: true, // 🆕
        primaryRole: "customer", // 🆕 Phase 4
        status: "active", // 🆕 Phase 4
        isActive: true,
        lastLogin: serverTimestamp(),
        lastActiveAt: serverTimestamp(), // 🆕
        version: 1, // 🆕 Schema version
        ...additionalData,
      };

      if (isNewUser) {
        // 🆕 PHASE 4: New user setup
        userData.createdAt = serverTimestamp();
        userData.loginCount = 1; // 🆕
        userData.profileCompletionScore = 30; // 🆕 Basic (phone only)

        await setDoc(userRef, userData);
        console.log("✅ New user created:", uid);
      } else {
        // 🆕 PHASE 4: Existing user - increment login count
        const updates: any = {
          ...userData,
          loginCount: increment(1), // 🆕
        };

        await setDoc(userRef, updates, { merge: true });
        console.log("✅ User profile updated:", uid);
      }

      setUserProfile(userData);
    } catch (error) {
      console.error("❌ Error creating/updating user profile:", error);
      throw error;
    }
  };

  // ==================== ONBOARDING ====================
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, "true");
      setOnboardingDone(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  };

  // ==================== LOGOUT ====================
  const logout = async () => {
    try {
      if (!USE_TEST_MODE && user) {
        await signOut(auth);
      }

      const firstLaunchValue = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      await AsyncStorage.clear();
      if (firstLaunchValue) {
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, firstLaunchValue);
      }

      setIsLoggedIn(false);
      setLanguage(false);
      setLocation(false);
      setPhoneNumber("");
      setConfirmation(null);
      setUser(null);
      setUserProfile(null);

      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // ==================== LANGUAGE & LOCATION ====================
  const setHasSelectedLanguage = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, String(value));
      setLanguage(value);
    } catch (error) {
      console.error("Error setting language:", error);
      throw error;
    }
  };

  const setHasSelectedLocation = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, String(value));
      setLocation(value);
    } catch (error) {
      console.error("Error setting location:", error);
      throw error;
    }
  };

  // ==================== SEND OTP ====================
  const sendOTP = async (phone: string) => {
    try {
      setPhoneNumber(phone);

      if (!/^\+977\d{10}$/.test(phone)) {
        throw new Error("Invalid phone number format. Use +977XXXXXXXXXX");
      }

      if (USE_TEST_MODE) {
        console.log("🧪 TEST MODE ACTIVE");
        console.log("📱 Phone:", phone);
        console.log("🔢 Use this OTP:", TEST_OTP);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await AsyncStorage.setItem(STORAGE_KEYS.TEST_PHONE, phone);
        return;
      }

      console.log("🚀 PRODUCTION MODE: Sending real OTP via Firebase");
      const result = await signInWithPhoneNumber(auth, phone);
      setConfirmation(result);
      console.log("✅ OTP sent successfully to:", phone);
    } catch (error: any) {
      console.error("❌ Send OTP error:", error);
      if (error.code === "auth/invalid-phone-number") {
        throw new Error("Invalid phone number");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many attempts. Please try again later");
      }
      throw error;
    }
  };

  // ==================== VERIFY OTP ====================
  const verifyOTP = async (code: string) => {
    try {
      if (USE_TEST_MODE) {
        console.log("🧪 TEST MODE: Verifying OTP");

        if (code !== TEST_OTP) {
          throw new Error(`Invalid OTP. Use: ${TEST_OTP}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const savedPhone = await AsyncStorage.getItem(STORAGE_KEYS.TEST_PHONE);
        if (!savedPhone) {
          throw new Error("Phone number not found. Please request OTP again.");
        }

        const testUserId = `test_${savedPhone.replace(/[^0-9]/g, "")}`;
        await AsyncStorage.setItem(STORAGE_KEYS.TEST_USER_ID, testUserId);
        await AsyncStorage.setItem(STORAGE_KEYS.LOGGED_IN, "true");

        // 🆕 PHASE 4: Create with enhanced fields
        try {
          await createOrUpdateUserProfile(testUserId, savedPhone, {
            name: "Test User",
            displayName: "Test User", // 🆕
            metadata: {
              source: "android",
              appVersion: "1.0.0",
            },
          });
        } catch (error) {
          console.log("⚠️ Skipping Firestore in test mode");
        }

        setIsLoggedIn(true);
        router.replace("/(tabs)/home");
        console.log("✅ Test login successful!");
        return;
      }

      // Production mode
      if (!confirmation) {
        throw new Error("No OTP request found. Please request a new OTP");
      }

      const userCredential = await confirmation.confirm(code);
      const firebaseUser = userCredential.user;

      // 🆕 PHASE 4: Enhanced user creation
      await createOrUpdateUserProfile(firebaseUser.uid, phoneNumber, {
        metadata: {
          source: "android", // You can detect this dynamically
          appVersion: "1.0.0",
        },
      });

      await AsyncStorage.setItem(STORAGE_KEYS.LOGGED_IN, "true");
      setIsLoggedIn(true);
      setUser(firebaseUser);

      router.replace("/(tabs)/home");
      console.log("✅ User logged in successfully:", firebaseUser.uid);
    } catch (error: any) {
      console.error("❌ Verify OTP error:", error);
      if (error.code === "auth/invalid-verification-code") {
        throw new Error("Invalid OTP code");
      } else if (error.code === "auth/code-expired") {
        throw new Error("OTP code expired. Please request a new one");
      }
      throw error;
    }
  };

  // ==================== USER PROFILE ====================
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user && !USE_TEST_MODE) {
        throw new Error("No user logged in");
      }

      const userId = USE_TEST_MODE
        ? (await AsyncStorage.getItem(STORAGE_KEYS.TEST_USER_ID)) || "test_user"
        : user?.uid;

      if (!userId) throw new Error("User ID not found");

      // 🆕 PHASE 4: Recalculate profile completion
      if (data.displayName || data.email || data.avatarUrl) {
        let score = 30; // Base (phone)
        if (data.displayName || userProfile?.displayName) score += 20;
        if (data.email || userProfile?.email) score += 15;
        if (data.avatarUrl || userProfile?.avatarUrl) score += 15;
        data.profileCompletionScore = Math.min(score, 100);
      }

      await createOrUpdateUserProfile(userId, phoneNumber, data);
      console.log("✅ User profile updated successfully");
    } catch (error) {
      console.error("❌ Error updating user profile:", error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      if (USE_TEST_MODE) {
        console.log("⚠️ Refresh user data not available in test mode");
        return;
      }
      if (!user) throw new Error("No user logged in");
      await loadUserProfile(user.uid);
    } catch (error) {
      console.error("❌ Error refreshing user data:", error);
      throw error;
    }
  };

  // 🆕 PHASE 4: Record user activity
  const recordActivity = async () => {
    try {
      if (!user && !USE_TEST_MODE) return;

      const userId = USE_TEST_MODE
        ? await AsyncStorage.getItem(STORAGE_KEYS.TEST_USER_ID)
        : user?.uid;

      if (!userId) return;

      await updateDoc(doc(db, "users", userId), {
        lastActiveAt: serverTimestamp(),
      });
    } catch (error) {
      // Silent fail - not critical
      console.warn("⚠️ Failed to record activity:", error);
    }
  };

  // 🆕 PHASE 4: Computed properties
  const isProfileComplete =
    !!userProfile &&
    (userProfile.profileCompletionScore ?? 0) >= 50;

  const needsOnboarding =
    isLoggedIn &&
    (!userProfile?.displayName && !userProfile?.name);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        // State
        isFirstLaunch,
        onboardingDone,
        isLoggedIn,
        hasSelectedLanguage,
        hasSelectedLocation,
        phoneNumber,
        user,
        userProfile,
        loading,
        isTestMode: USE_TEST_MODE,

        // 🆕 PHASE 4: Enhanced state
        isProfileComplete,
        needsOnboarding,

        // Actions
        completeOnboarding,
        logout,
        setHasSelectedLanguage,
        setHasSelectedLocation,
        sendOTP,
        verifyOTP,
        updateUserProfile,
        refreshUserData,

        // 🆕 PHASE 4: New actions
        recordActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==================== HOOK ====================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export { User };

