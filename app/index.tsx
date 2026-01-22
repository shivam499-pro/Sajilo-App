// app/index.tsx - Enhanced Boot Logic with Phase 4 Boot Manager

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { bootManager, BootPhase, NavigationDestination } from '../services/bootManager';
import Constants from 'expo-constants';

export default function Index() {
  const {
    isLoggedIn,
    userProfile,
    onboardingDone,
    hasSelectedLanguage,
    hasSelectedLocation,
    loading: authLoading,
  } = useAuth();

  const [bootPhase, setBootPhase] = useState<BootPhase>('splash');
  const [bootMessage, setBootMessage] = useState('Loading Sajilo...');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Wait for AuthContext to finish initializing
    if (authLoading) {
      setBootMessage('Initializing...');
      return;
    }

    // Once auth is loaded, execute boot sequence
    executeBoot();
  }, [authLoading, isLoggedIn, userProfile, onboardingDone, hasSelectedLanguage, hasSelectedLocation]);

  /**
   * Main boot execution using Phase 4 Boot Manager
   */
  const executeBoot = async () => {
    try {
      setBootPhase('checking_config');
      setBootMessage('Checking app status...');

      // Small delay to show splash (minimum UX - 1 second)
      await delay(1000);

      // Execute Phase 4 boot manager
      const result = await bootManager.executeBoot(
        isLoggedIn,
        userProfile,
        onboardingDone,
        hasSelectedLanguage,
        hasSelectedLocation
      );

      // Update UI phase
      setBootPhase(result.phase);

      // Navigate based on boot result
      await navigateToDestination(result.destination, result.metadata);

      // Record successful boot (version tracking)
      await bootManager.recordBootVersion();

    } catch (error) {
      console.error('❌ Boot error:', error);
      setShowError(true);
      setBootMessage('Something went wrong');

      // Fallback to welcome after 2 seconds
      setTimeout(() => {
        router.replace('/welcome');
      }, 2000);
    }
  };

  /**
   * Navigate to the correct screen based on boot result
   */
  const navigateToDestination = async (
    destination: NavigationDestination,
    metadata?: any
  ) => {
    console.log(`🧭 Navigating to: ${destination}`);

    // Add smooth transition delay
    const smoothTransition = async (message: string, screen: string) => {
      setBootMessage(message);
      await delay(500);
      router.replace(screen as any);
    };

    switch (destination) {
      case 'maintenance':
        setBootMessage(metadata?.maintenanceMessage || 'Under maintenance');
        // TODO: Create maintenance screen
        // For now, show message and stay on this screen
        await delay(3000);
        break;

      case 'force_update':
        setBootMessage('Update required');
        // TODO: Create update required screen
        // For now, show alert and go to welcome
        await delay(2000);
        router.replace('/welcome');
        break;

      case 'welcome':
        await smoothTransition('Welcome to Sajilo!', '/welcome');
        break;

      case 'login':
        await smoothTransition('Please log in', '/(auth)/login');
        break;

      case 'create_profile':
        // User is logged in but has no Firestore profile
        // For Phase 4, redirect to language selection which will trigger profile creation
        await smoothTransition('Setting up your profile...', '/language/select-language');
        break;

      case 'language_selection':
        await smoothTransition('Choose your language', '/language/select-language');
        break;

      case 'location_selection':
        await smoothTransition('Select your location', '/location/select-location');
        break;

      case 'account_suspended':
        setBootMessage('Account suspended');
        // TODO: Create suspension screen
        // For now, show alert and logout
        await delay(1000);
        alert(metadata?.reason || 'Your account has been suspended');
        router.replace('/(auth)/login');
        break;

      case 'account_blocked':
        setBootMessage('Account blocked');
        await delay(1000);
        alert(metadata?.reason || 'Your account has been blocked. Contact support.');
        router.replace('/(auth)/login');
        break;

      case 'account_deleted':
        setBootMessage('Account deleted');
        await delay(1000);
        alert(metadata?.reason || 'This account no longer exists');
        router.replace('/(auth)/login');
        break;

      case 'home':
        await smoothTransition('Welcome back!', '/(tabs)');
        break;

      default:
        console.warn('⚠️  Unknown destination:', destination);
        router.replace('/welcome');
    }
  };

  /**
   * Helper: Delay for smooth transitions
   */
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Get loading indicator color based on phase
   */
  const getPhaseColor = () => {
    if (showError) return '#ef4444';
    
    switch (bootPhase) {
      case 'splash': return '#94a3b8';
      case 'checking_config': return '#60a5fa';
      case 'checking_auth': return '#34d399';
      case 'loading_profile': return '#fbbf24';
      case 'ready': return '#10b981';
      default: return '#94a3b8';
    }
  };

  // ==================== RENDER ====================

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        {/* TODO: Replace with your actual logo component */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>Sajilo</Text>
          <Text style={styles.logoSubtext}>DELIVERY</Text>
        </View>
      </View>

      {/* Loading Section */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={getPhaseColor()} 
        />
        <Text style={[
          styles.messageText,
          showError && styles.errorText
        ]}>
          {bootMessage}
        </Text>

        {/* Debug Info (only in development) */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Phase: {bootPhase}</Text>
            <Text style={styles.debugText}>Auth: {isLoggedIn ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>Profile: {userProfile ? 'Yes' : 'No'}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>
          Version {Constants.expoConfig?.version || '1.0.0'}
        </Text>
        <Text style={styles.footerSubtext}>
          Made with ❤️ in Nepal
        </Text>
      </View>
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark blue - adjust to match your theme
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  logoSubtext: {
    fontSize: 20,
    color: '#94a3b8',
    marginTop: 8,
    letterSpacing: 6,
    fontWeight: '300',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#cbd5e1',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
  },
  debugContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  debugText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginVertical: 2,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#64748b',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#475569',
  },
});