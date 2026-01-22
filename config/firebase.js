// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getRemoteConfig } from "firebase/remote-config"; // 🆕 PHASE 4
import {getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9clXMGYxd2bHyyqu8TM7Hx5BjnD_Pxqc",
  authDomain: "sajilo-app-e9a95.firebaseapp.com",
  projectId: "sajilo-app-e9a95",
  storageBucket: "sajilo-app-e9a95.firebasestorage.app",
  messagingSenderId: "185977764836",
  appId: "1:185977764836:web:d8801067249349402325f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


// ==================== 🆕 PHASE 4: REMOTE CONFIG ====================

// Initialize Remote Config
export const remoteConfig = getRemoteConfig(app);

// Remote Config settings
remoteConfig.settings = {
  minimumFetchIntervalMillis: __DEV__ ? 60000 : 3600000, // 1 min in dev, 1 hour in prod
  fetchTimeoutMillis: 10000, // 10 seconds timeout
};

// Default values (used when fetch fails or offline)
remoteConfig.defaultConfig = {
  // App Control
  maintenance_mode: false,
  maintenance_message: "हामी अहिले मर्मत गर्दैछौं। कृपया केही समय पछि फेरि प्रयास गर्नुहोस्। / We're currently under maintenance. Please try again later.",
  
  // Version Control
  min_app_version: "1.0.0",
  force_update_url_android: "https://play.google.com/store/apps/details?id=com.sajilo.delivery",
  force_update_url_ios: "https://apps.apple.com/app/sajilo-delivery/id123456789", // Update when iOS app ready
  
  // Feature Flags (Phase 4: Only orders active)
  features_enabled: JSON.stringify({
    orders: true,
    payments: false,      // Phase 6
    delivery: false,      // Phase 7
    notifications: false, // Phase 7
    chat: false,          // Future
  }),
  
  // Regional Control (for gradual rollout)
  available_regions: JSON.stringify([
    "Kathmandu",
    "Lalitpur", 
    "Bhaktapur"
  ]),
  
  // Service Hours (can be controlled remotely)
  service_hours: JSON.stringify({
    start: "06:00",
    end: "23:00",
    timezone: "Asia/Kathmandu"
  }),
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get Remote Config value with fallback
 * Usage: getConfigValue('maintenance_mode')
 */
export const getConfigValue = (key) => {
  try {
    return remoteConfig.getValue(key);
  } catch (error) {
    console.warn(`⚠️  Failed to get config for ${key}:`, error);
    return remoteConfig.defaultConfig[key];
  }
};

/**
 * Fetch latest config from Firebase
 * Call this on app boot or periodically
 */
export const fetchRemoteConfig = async () => {
  try {
    console.log('☁️  Fetching remote config...');
    const { fetchAndActivate } = await import('firebase/remote-config');
    const activated = await fetchAndActivate(remoteConfig);
    
    if (activated) {
      console.log('✅ Remote config fetched and activated');
    } else {
      console.log('ℹ️  Remote config fetched (not activated - values unchanged)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error fetching remote config:', error);
    return false;
  }
};

// ==================== EXPORTS ====================


// Export all services
export { app as firebaseApp };




export default app;