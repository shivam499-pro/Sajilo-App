/**
 * Firebase Error Handler for Sajilo Delivery App
 * Provides user-friendly error messages for common Firebase errors
 */

// Create this file: utils/firebaseErrors.ts

export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    // Authentication Errors
    "auth/invalid-phone-number": "Invalid phone number. Please check and try again.",
    "auth/invalid-verification-code": "Invalid OTP code. Please enter the correct code.",
    "auth/code-expired": "OTP code has expired. Please request a new one.",
    "auth/too-many-requests": "Too many attempts. Please try again after some time.",
    "auth/quota-exceeded": "SMS quota exceeded. Please contact support.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "auth/invalid-credential": "Invalid credentials. Please try again.",
    "auth/operation-not-allowed": "This operation is not allowed. Contact support.",
    "auth/requires-recent-login": "Please log in again to continue.",
    
    // Firestore Errors
    "firestore/permission-denied": "You don't have permission to access this data.",
    "firestore/not-found": "Requested data not found.",
    "firestore/already-exists": "This data already exists.",
    "firestore/failed-precondition": "Operation failed. Please try again.",
    "firestore/unavailable": "Service temporarily unavailable. Please try again.",
    
    // Storage Errors
    "storage/unauthorized": "You don't have permission to upload files.",
    "storage/canceled": "Upload canceled.",
    "storage/unknown": "Unknown error occurred during upload.",
    "storage/object-not-found": "File not found.",
    "storage/quota-exceeded": "Storage quota exceeded.",
  };

  return errorMessages[errorCode] || "An unexpected error occurred. Please try again.";
};

/**
 * COMPREHENSIVE DOCUMENTATION FOR YOUR SAJILO DELIVERY APP
 * =======================================================
 */

/**
 * 1. FIREBASE SETUP CHECKLIST
 * ---------------------------
 * ✅ Firebase project created: sajilo-app-e9a95
 * ✅ Android package: com.sajilo.app
 * ✅ google-services.json added to android/app/
 * ✅ Firebase Authentication enabled (Phone)
 * ✅ Firestore database created
 * ✅ Storage bucket created
 * 
 * NEXT STEPS:
 * - Enable Phone Authentication in Firebase Console
 * - Set up Firestore Security Rules
 * - Configure reCAPTCHA for phone auth
 */

/**
 * 2. FIRESTORE SECURITY RULES
 * ---------------------------
 * Add these rules in Firebase Console → Firestore → Rules
 */

const FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Users can read and write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Anyone can read basic user info (for app functionality)
      allow read: if request.auth != null;
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Users can create orders
      allow create: if request.auth != null;
      
      // Only admins can update/delete orders
      allow update, delete: if request.auth != null && 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Restaurants collection
    match /restaurants/{restaurantId} {
      // Anyone authenticated can read restaurants
      allow read: if request.auth != null;
      
      // Only admins can create/update/delete restaurants
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Cart collection (optional, if storing cart in Firestore)
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
`;

/**
 * 3. STORAGE SECURITY RULES
 * -------------------------
 * Add these rules in Firebase Console → Storage → Rules
 */

const STORAGE_RULES = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // User profile images
    match /users/{userId}/profile/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Restaurant images (admin only)
    match /restaurants/{restaurantId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      // Check if user is admin in Firestore
                      firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
`;

/**
 * 4. FIRESTORE DATA STRUCTURE
 * ---------------------------
 */

// Users Collection: /users/{userId}
interface FirestoreUser {
  uid: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  photoURL?: string;
  language?: string;
  location?: {
    city: string;
    area: string;
    latitude?: number;
    longitude?: number;
  };
  addresses?: Address[];
  role?: 'user' | 'admin' | 'delivery';
  isActive: boolean;
//   createdAt: FirebaseFirestore.Timestamp;
//   lastLogin: FirebaseFirestore.Timestamp;
}

interface Address {
  id: string;
  label: string; // Home, Work, Other
  address: string;
  city: string;
  area: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

// Orders Collection: /orders/{orderId}
interface FirestoreOrder {
  orderId: string;
  userId: string;
  userPhone: string;
  userName: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'wallet';
  deliveryAddress: Address;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  specialInstructions?: string;
//   createdAt: FirebaseFirestore.Timestamp;
//   updatedAt: FirebaseFirestore.Timestamp;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customizations?: string[];
}

// Restaurants Collection: /restaurants/{restaurantId}
interface FirestoreRestaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  rating: number;
  totalRatings: number;
  priceRange: '₹' | '₹₹' | '₹₹₹';
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  location: {
    city: string;
    area: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  images: {
    logo: string;
    banner: string;
    gallery?: string[];
  };
  openingHours: {
    [day: string]: { open: string; close: string; isOpen: boolean };
  };
  isActive: boolean;
  isOpen: boolean;
  categories: string[];
//   createdAt: FirebaseFirestore.Timestamp;
//   updatedAt: FirebaseFirestore.Timestamp;
}

// Menu Items Collection: /restaurants/{restaurantId}/menu/{itemId}
interface FirestoreMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // For discounts
  category: string;
  cuisine: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number; // minutes
  rating?: number;
  customizations?: {
    name: string;
    options: { name: string; price: number }[];
  }[];
  tags?: string[];
}

/**
 * 5. COMMON ERRORS & SOLUTIONS
 * ----------------------------
 */

const COMMON_ERRORS = {
  "Phone Auth Not Working": {
    problem: "OTP not being sent or reCAPTCHA not showing",
    solutions: [
      "1. Enable Phone Authentication in Firebase Console",
      "2. Add your Android SHA-1 certificate fingerprint in Firebase",
      "3. Ensure google-services.json is in android/app/",
      "4. For testing, add test phone numbers in Firebase Console",
      "5. Check Firebase quota limits (100 SMS/day on free plan)",
    ],
  },
  
  "AsyncStorage Errors": {
    problem: "Data not persisting between app restarts",
    solutions: [
      "1. Ensure AsyncStorage is installed: expo install @react-native-async-storage/async-storage",
      "2. Check Android permissions in app.json",
      "3. Clear app data and reinstall if corrupted",
      "4. Wrap storage operations in try-catch blocks",
    ],
  },
  
  "Context Not Available": {
    problem: "useAuth or useCart throwing 'must be used inside Provider' error",
    solutions: [
      "1. Wrap your app with AuthProvider and CartProvider in _layout.tsx",
      "2. Check provider order - AuthProvider should wrap CartProvider",
      "3. Ensure you're calling hooks inside functional components",
    ],
  },
  
  "Navigation Issues": {
    problem: "router.replace or router.push not working",
    solutions: [
      "1. Ensure you're using expo-router correctly",
      "2. Check file structure matches route paths",
      "3. Use router.replace() for auth redirects, not router.push()",
      "4. Clear navigation stack when logging out",
    ],
  },
};

/**
 * 6. TESTING CHECKLIST
 * --------------------
 */

const TESTING_CHECKLIST = [
  "✅ Test phone auth with real phone number",
  "✅ Test OTP verification",
  "✅ Test app restart (should stay logged in)",
  "✅ Test logout (should clear all data)",
  "✅ Test cart persistence across app restarts",
  "✅ Test offline functionality (cart should work)",
  "✅ Test network errors (show proper error messages)",
  "✅ Test onboarding flow for new users",
  "✅ Test language and location selection",
  "✅ Test Firestore data creation on first login",
];

/**
 * 7. PRODUCTION DEPLOYMENT CHECKLIST
 * ----------------------------------
 */

const PRODUCTION_CHECKLIST = [
  "🔒 Update Firestore security rules",
  "🔒 Update Storage security rules",
  "🔑 Remove test phone numbers from Firebase Console",
  "📱 Generate production SHA-1 and add to Firebase",
  "🌐 Set up proper reCAPTCHA domain verification",
  "💳 Set up payment gateway (eSewa, Khalti for Nepal)",
  "📧 Set up email notifications (SendGrid, etc.)",
  "📲 Set up push notifications (FCM)",
  "🗺️ Integrate Google Maps for delivery tracking",
  "📊 Set up analytics (Firebase Analytics)",
  "🐛 Set up crash reporting (Firebase Crashlytics)",
  "💰 Upgrade Firebase plan if needed (Blaze for production)",
];

export {
  FIRESTORE_RULES,
  STORAGE_RULES,
  COMMON_ERRORS,
  TESTING_CHECKLIST,
  PRODUCTION_CHECKLIST,
};