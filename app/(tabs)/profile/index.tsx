import { lightTap, mediumTap } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🆕 PHASE 4: Permission system
import { useAuth as useAuthContext } from '@/context/AuthContext';
import { getUserPermissions, hasPermission, PERMISSIONS } from '@/utils/permissions';
import { useEffect } from "react"; // Add this if not already imported

/* ===== IMAGE PLACEHOLDERS ===== */
import UserAvatar from "../../../assets/images/user.png";

// Sample user data (replace with actual data from API/AsyncStorage)
const USER_DATA = {
  name: "John Doe",
  phone: "+977 9876543210",
  email: "john.doe@example.com",
  avatar: UserAvatar,
  stats: {
    orders: 24,
    points: 350,
    savings: 1240,
  },
};

export default function ProfileScreen() {
  const [user] = useState(USER_DATA);
  const { userProfile } = useAuthContext();

  // 🆕 PHASE 4: Debug user permissions (development only)
  useEffect(() => {
    if (__DEV__ && userProfile) {
      console.log('👤 User Profile:', userProfile);
      // Only call getUserPermissions if userProfile matches your app's User type
      if (
        userProfile &&
        'primaryRole' in userProfile &&
        'roles' in userProfile &&
        'status' in userProfile &&
        'lastLoginAt' in userProfile &&
        'deviceIds' in userProfile
      ) {
        // Only call getUserPermissions if userProfile matches your app's User type
        console.log('🔐 User Permissions:', getUserPermissions(userProfile as any));
      } else {
        console.log('⚠️ userProfile is not of app User type:', userProfile);
      }
    }
  }, [userProfile]);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            mediumTap();

            // Clear async storage
            await AsyncStorage.removeItem("isLoggedIn");

            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    lightTap();
    // Navigate to edit profile screen
    router.push("../edit-profile");
  };

  const handleMenuPress = (screen: string) => {
    lightTap();
    // Navigate to respective screens
    switch (screen) {
      case "orders":
        router.push("../orders");
        break;
      case "addresses":
        router.push("../addresses");
        break;
      case "favorites":
        router.push("../favorites");
        break;
      case "payments":
        router.push("../payments");
        break;
      case "wallet":
        router.push("../wallet");
        break;
      case "help":
        router.push("../help");
        break;
      case "settings":
        router.push("../settings");
        break;
      case "about":
        router.push("../about");
        break;
      default:
        Alert.alert("Coming Soon", "This feature is under development");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.gradient}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => {
              lightTap();
              handleMenuPress("settings");
            }}
            style={styles.settingsBtn}
          >
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* USER PROFILE CARD */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image source={user.avatar} style={styles.avatar} />
              <TouchableOpacity
                style={styles.editAvatarBtn}
                onPress={() => {
                  lightTap();
                  Alert.alert("Upload Photo", "Choose profile picture");
                }}
              >
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={16} color="#2DA8FF" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* 🆕 PHASE 4: Account Status Warning */}
          {userProfile && userProfile.status !== 'active' && (
            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={24} color="#ef4444" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.warningTitle}>
                  Account {userProfile.status === 'suspended' ? 'Suspended' : 'Inactive'}
                </Text>
                <Text style={styles.warningText}>
                  {userProfile.statusReason || 'Please contact support'}
                </Text>
              </View>
            </View>
          )}

          {/* STATS CARDS */}
          <View style={styles.statsContainer}>
            <StatCard
              icon="receipt-outline"
              label="Orders"
              value={user.stats.orders.toString()}
              onPress={() => handleMenuPress("orders")}
            />
            <StatCard
              icon="star-outline"
              label="Points"
              value={user.stats.points.toString()}
              onPress={() => Alert.alert("Points", "Redeem your loyalty points")}
            />
            <StatCard
              icon="wallet-outline"
              label="Savings"
              value={`₹${user.stats.savings}`}
              onPress={() => handleMenuPress("wallet")}
            />
          </View>

          {/* MENU SECTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuBox}>
              <ProfileItem
                icon="location-outline"
                title="Saved Addresses"
                onPress={() => handleMenuPress("addresses")}
              />
              <ProfileItem
                icon="heart-outline"
                title="Favorite Restaurants"
                onPress={() => handleMenuPress("favorites")}
              />
              <ProfileItem
                icon="card-outline"
                title="Payment Methods"
                onPress={() => handleMenuPress("payments")}
              />
              <ProfileItem
                icon="wallet-outline"
                title="Wallet & Rewards"
                onPress={() => handleMenuPress("wallet")}
                showBadge
                badgeText="₹350"
              />
            </View>
          </View>

          {/* 🆕 PHASE 4: Admin Section - Only visible to admins */}
          {userProfile && hasPermission(userProfile as any, PERMISSIONS.SYSTEM_CONFIG) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>⚠️ Admin Panel</Text>
              <View style={styles.menuBox}>
                <ProfileItem
                  icon="shield-checkmark-outline"
                  title="Admin Dashboard"
                  subtitle="System management"
                  onPress={() => Alert.alert('Admin', 'Admin features coming soon')}
                />
                <ProfileItem
                  icon="people-outline"
                  title="Manage Users"
                  subtitle="View all users"
                  onPress={() => Alert.alert('Admin', 'User management coming soon')}
                />
                <ProfileItem
                  icon="restaurant-outline"
                  title="Manage Vendors"
                  subtitle="Vendor approval"
                  onPress={() => Alert.alert('Admin', 'Vendor management coming soon')}
                />
                <ProfileItem
                  icon="analytics-outline"
                  title="System Analytics"
                  subtitle="View platform stats"
                  onPress={() => Alert.alert('Admin', 'Analytics coming soon')}
                />
              </View>
            </View>
          )}

          {/* 🆕 PHASE 4: Vendor Section - Only visible to vendors (Phase 5+) */}
          {userProfile && hasPermission(userProfile as any, PERMISSIONS.VENDOR_EDIT_OWN) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#2DA8FF' }]}>🏪 Vendor Dashboard</Text>
              <View style={styles.menuBox}>
                <ProfileItem
                  icon="restaurant-outline"
                  title="Manage Restaurant"
                  subtitle="Menu, hours, settings"
                  onPress={() => Alert.alert('Vendor', 'Vendor dashboard coming in Phase 5')}
                />
                <ProfileItem
                  icon="fast-food-outline"
                  title="Manage Products"
                  subtitle="Add/edit items"
                  onPress={() => Alert.alert('Vendor', 'Product management coming in Phase 5')}
                />
                <ProfileItem
                  icon="bar-chart-outline"
                  title="Sales Analytics"
                  subtitle="View your stats"
                  onPress={() => Alert.alert('Vendor', 'Vendor analytics coming in Phase 5')}
                />
              </View>
            </View>
          )}

          {/* 🆕 PHASE 4: Rider Section - Only visible to riders (Phase 7+) */}
          {userProfile && hasPermission(userProfile as any, PERMISSIONS.DELIVERY_ACCEPT) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#22c55e' }]}>🏍️ Rider Dashboard</Text>
              <View style={styles.menuBox}>
                <ProfileItem
                  icon="bicycle-outline"
                  title="Start Delivering"
                  subtitle="Go online"
                  onPress={() => Alert.alert('Rider', 'Rider features coming in Phase 7')}
                />
                <ProfileItem
                  icon="cash-outline"
                  title="Earnings"
                  subtitle="View your income"
                  onPress={() => Alert.alert('Rider', 'Earnings tracking coming in Phase 7')}
                />
              </View>
            </View>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.menuBox}>
              <ProfileItem
                icon="help-circle-outline"
                title="Help & Support"
                onPress={() => handleMenuPress("help")}
              />
              <ProfileItem
                icon="chatbubble-outline"
                title="Chat with Us"
                onPress={() =>
                  Alert.alert("Chat", "Connect with our support team")
                }
              />
              <ProfileItem
                icon="call-outline"
                title="Call Us"
                subtitle="+977-9812345678"
                onPress={() => Alert.alert("Call", "Calling support...")}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More</Text>
            <View style={styles.menuBox}>
              <ProfileItem
                icon="notifications-outline"
                title="Notifications"
                onPress={() => handleMenuPress("settings")}
              />
              <ProfileItem
                icon="language-outline"
                title="Language"
                subtitle="English"
                onPress={() =>
                  Alert.alert("Language", "Select your preferred language")
                }
              />
              <ProfileItem
                icon="shield-checkmark-outline"
                title="Privacy Policy"
                onPress={() => handleMenuPress("privacy")}
              />
              <ProfileItem
                icon="document-text-outline"
                title="Terms & Conditions"
                onPress={() => handleMenuPress("terms")}
              />
              <ProfileItem
                icon="information-circle-outline"
                title="About Sajilo"
                subtitle="Version 1.0.0"
                onPress={() => handleMenuPress("about")}
              />
            </View>
          </View>

          {/* LOGOUT BUTTON */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* APP INFO */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Sajilo Delivery App</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appCopyright}>
              © 2024 Sajilo. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

/* ===== STAT CARD COMPONENT ===== */
function StatCard({
  icon,
  label,
  value,
  onPress,
}: {
  icon: any;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#2DA8FF" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ===== PROFILE ITEM COMPONENT ===== */
function ProfileItem({
  icon,
  title,
  subtitle,
  onPress,
  showBadge,
  badgeText,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeText?: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color="#2DA8FF" />
        </View>
        <View>
          <Text style={styles.menuText}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtext}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.menuRight}>
        {showBadge && badgeText && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  gradient: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
  },

  backBtn: {
    padding: 5,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },

  settingsBtn: {
    padding: 5,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  // Profile Card
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#2DA8FF",
  },

  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2DA8FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },

  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },

  userPhone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },

  userEmail: {
    fontSize: 13,
    color: "#999",
    marginBottom: 15,
  },

  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#2DA8FF",
  },

  editProfileText: {
    color: "#2DA8FF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Stats Container
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    color: "#000",
  },

  statLabel: {
    fontSize: 12,
    color: "#666",
  },

  // Section
  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    paddingHorizontal: 15,
    marginBottom: 10,
  },

  menuBox: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  // Menu Item
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },

  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },

  menuSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  badge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  // Logout Button
  logoutBtn: {
    backgroundColor: "#ef4444",
    marginHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 20,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // App Info
  appInfo: {
    alignItems: "center",
    paddingVertical: 20,
  },

  appInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },

  appVersion: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },

  appCopyright: {
    fontSize: 11,
    color: "#ccc",
  },

  // Warning Card
  warningCard: {
    backgroundColor: "#fef2f2",
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },

  warningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
    marginBottom: 4,
  },

  warningText: {
    fontSize: 12,
    color: "#999",
  },
});