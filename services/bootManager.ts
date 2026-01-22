// services/bootManager.ts - Centralized App Boot Logic (Works with your setup)

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import Constants from 'expo-constants';
import { fetchAndActivate, getValue } from 'firebase/remote-config';
import { remoteConfig } from '@/config/firebase';

// ==================== TYPES ====================

export type BootPhase = 
  | 'splash'
  | 'checking_config'
  | 'checking_auth'
  | 'loading_profile'
  | 'ready';

export type NavigationDestination =
  | 'maintenance'          // App under maintenance
  | 'force_update'         // Must update app
  | 'welcome'              // First time user
  | 'login'                // Need to login
  | 'create_profile'       // Logged in but no name
  | 'language_selection'   // Need to select language
  | 'location_selection'   // Need to select location
  | 'account_suspended'    // Account suspended
  | 'account_blocked'      // Account blocked
  | 'account_deleted'      // Account was deleted
  | 'home';                // Normal home screen

export interface BootResult {
  destination: NavigationDestination;
  phase: BootPhase;
  metadata?: {
    reason?: string;
    updateUrl?: string;
    maintenanceMessage?: string;
    canRetry?: boolean;
  };
}

export interface RemoteConfigValues {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  minAppVersion: string;
  forceUpdateUrl: string;
  featuresEnabled: {
    orders: boolean;
    payments: boolean;
    delivery: boolean;
  };
}

// ==================== CONSTANTS ====================

const STORAGE_KEYS = {
  FIRST_LAUNCH: 'isFirstLaunch',
  ONBOARDING_DONE: 'onboardingDone',
  LAST_BOOT_VERSION: 'lastBootVersion',
  CACHED_CONFIG: 'cachedRemoteConfig',
} as const;

const NETWORK_TIMEOUT = 5000; // 5 seconds
const CONFIG_FETCH_TIMEOUT = 3000; // 3 seconds

// ==================== BOOT MANAGER ====================

class BootManager {
  private currentPhase: BootPhase = 'splash';
  
  /**
   * Main boot sequence orchestrator
   * Call this from your BootScreen component
   */
  async executeBoot(
    isAuthenticated: boolean,
    userProfile: any | null,
    onboardingDone: boolean,
    hasSelectedLanguage: boolean,
    hasSelectedLocation: boolean
  ): Promise<BootResult> {
    try {
      console.log('🚀 Starting boot sequence...');
      
      // PHASE 1: Check network and remote config
      this.currentPhase = 'checking_config';
      const configCheck = await this.checkRemoteConfig();
      if (configCheck) return configCheck;
      
      // PHASE 2: Check first launch
      const isFirstLaunch = await this.isFirstLaunch();
      if (isFirstLaunch) {
        return this.createResult('welcome', 'First time user');
      }
      
      // PHASE 3: Check authentication
      this.currentPhase = 'checking_auth';
      if (!isAuthenticated) {
        return this.createResult('login', 'User not authenticated');
      }
      
      // PHASE 4: Check user profile
      this.currentPhase = 'loading_profile';
      
      // No profile = need to create one
      if (!userProfile) {
        return this.createResult('create_profile', 'Profile not found');
      }
      
      // PHASE 5: Check account status
      const statusCheck = this.checkAccountStatus(userProfile);
      if (statusCheck) return statusCheck;
      
      // PHASE 6: Check onboarding completion
      if (!onboardingDone) {
        if (!hasSelectedLanguage) {
          return this.createResult('language_selection', 'Language not selected');
        }
        if (!hasSelectedLocation) {
          return this.createResult('location_selection', 'Location not selected');
        }
      }
      
      // PHASE 7: All checks passed - go to home
      this.currentPhase = 'ready';
      return this.createResult('home', 'Boot complete');
      
    } catch (error) {
      console.error('❌ Boot sequence error:', error);
      return this.createResult('login', 'Boot error', { canRetry: true });
    }
  }
  
  /**
   * PHASE 1: Check remote config for maintenance/updates
   */
  private async checkRemoteConfig(): Promise<BootResult | null> {
    try {
      // Check network first
      const networkState = await Promise.race([
        Network.getNetworkStateAsync(),
        this.timeout(NETWORK_TIMEOUT, { isConnected: true, isInternetReachable: true })
      ]);
      
      if (!networkState.isConnected) {
        console.log('📵 No network - using cached config');
        return await this.loadCachedConfig();
      }
      
      // Fetch remote config
      console.log('☁️  Fetching remote config...');
      
      try {
        const configPromise = fetchAndActivate(remoteConfig);
        const success = await Promise.race([
          configPromise,
          this.timeout(CONFIG_FETCH_TIMEOUT, false)
        ]);
        
        if (!success) {
          console.log('⏱️  Config fetch timeout - using cached');
          return await this.loadCachedConfig();
        }
      } catch (configError: any) {
        // IndexedDB error is expected in React Native - not critical
        if (configError.message?.includes('indexedDB')) {
          console.log('ℹ️  Remote config using memory cache (React Native mode)');
        } else {
          console.warn('⚠️  Remote config error:', configError.message);
        }
        return await this.loadCachedConfig();
      }
      
      // Parse config values
      const config: RemoteConfigValues = {
        maintenanceMode: getValue(remoteConfig, 'maintenance_mode').asBoolean(),
        maintenanceMessage: getValue(remoteConfig, 'maintenance_message').asString(),
        minAppVersion: getValue(remoteConfig, 'min_app_version').asString(),
        forceUpdateUrl: getValue(remoteConfig, 'force_update_url_android').asString(),
        featuresEnabled: JSON.parse(
          getValue(remoteConfig, 'features_enabled').asString() || 
          '{"orders":true,"payments":false,"delivery":false}'
        ),
      };
      
      // Cache the config
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_CONFIG, JSON.stringify(config));
      
      // Check maintenance mode
      if (config.maintenanceMode) {
        return this.createResult('maintenance', 'App under maintenance', {
          maintenanceMessage: config.maintenanceMessage,
        });
      }
      
      // Check version requirement
      const currentVersion = Constants.expoConfig?.version || '1.0.0';
      if (this.isVersionLower(currentVersion, config.minAppVersion)) {
        return this.createResult('force_update', 'App update required', {
          updateUrl: config.forceUpdateUrl,
        });
      }
      
      console.log('✅ Remote config check passed');
      return null;
      
    } catch (error) {
      console.error('⚠️  Remote config error:', error);
      return await this.loadCachedConfig();
    }
  }
  
  /**
   * Load cached remote config (offline fallback)
   */
  private async loadCachedConfig(): Promise<BootResult | null> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_CONFIG);
      if (!cached) return null;
      
      const config: RemoteConfigValues = JSON.parse(cached);
      
      if (config.maintenanceMode) {
        return this.createResult('maintenance', 'App under maintenance (cached)', {
          maintenanceMessage: config.maintenanceMessage,
        });
      }
      
      return null;
    } catch (error) {
      console.error('⚠️  Error loading cached config:', error);
      return null;
    }
  }
  
  /**
   * Check if user is launching app for the first time
   */
  private async isFirstLaunch(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    
    if (value === null) {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
      return true;
    }
    
    return false;
  }
  
  /**
   * Check user account status
   */
  private checkAccountStatus(userProfile: any): BootResult | null {
    const status = userProfile.status || 'active';
    
    switch (status) {
      case 'suspended':
        return this.createResult('account_suspended', 'Account suspended', {
          reason: userProfile.statusReason || 'Your account has been suspended',
        });
        
      case 'blocked':
        return this.createResult('account_blocked', 'Account blocked', {
          reason: userProfile.statusReason || 'Your account has been blocked',
        });
        
      case 'deleted':
        return this.createResult('account_deleted', 'Account deleted', {
          reason: 'This account has been deleted. Please register again.',
        });
        
      case 'active':
      default:
        return null;
    }
  }
  
  /**
   * Helper: Create boot result object
   */
  private createResult(
    destination: NavigationDestination,
    reason?: string,
    metadata?: BootResult['metadata']
  ): BootResult {
    console.log(`📍 Navigation: ${destination}${reason ? ` (${reason})` : ''}`);
    
    return {
      destination,
      phase: this.currentPhase,
      metadata: {
        reason,
        ...metadata,
      },
    };
  }
  
  /**
   * Helper: Compare semantic versions
   */
  private isVersionLower(current: string, required: string): boolean {
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      const cur = currentParts[i] || 0;
      const req = requiredParts[i] || 0;
      
      if (cur < req) return true;
      if (cur > req) return false;
    }
    
    return false;
  }
  
  /**
   * Helper: Promise timeout
   */
  private timeout<T>(ms: number, value: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
  }
  
  /**
   * PUBLIC: Reset first launch (for testing)
   */
  async resetFirstLaunch(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.FIRST_LAUNCH);
  }
  
  /**
   * PUBLIC: Get current phase
   */
  getCurrentPhase(): BootPhase {
    return this.currentPhase;
  }
  
  /**
   * PUBLIC: Record boot version
   */
  async recordBootVersion(): Promise<void> {
    const currentVersion = Constants.expoConfig?.version || '1.0.0';
    const lastVersion = await AsyncStorage.getItem(STORAGE_KEYS.LAST_BOOT_VERSION);
    
    if (lastVersion !== currentVersion) {
      console.log(`📦 App updated: ${lastVersion || 'new'} → ${currentVersion}`);
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_BOOT_VERSION, currentVersion);
    }
  }
}

// Export singleton
export const bootManager = new BootManager();
export default BootManager;