import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { lightTap } from "@/utils/haptics";

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.gradient}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              lightTap();
              router.back();
            }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* NOTIFICATIONS SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.menuBox}>
              <SettingItem
                icon="notifications-outline"
                title="Push Notifications"
                subtitle="Receive push notifications on your device"
                isSwitch
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
              <SettingItem
                icon="mail-outline"
                title="Email Notifications"
                subtitle="Get updates via email"
                isSwitch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
              />
              <SettingItem
                icon="chatbox-outline"
                title="SMS Notifications"
                subtitle="Receive SMS for order updates"
                isSwitch
                value={smsNotifications}
                onValueChange={setSmsNotifications}
              />
              <SettingItem
                icon="receipt-outline"
                title="Order Updates"
                subtitle="Get notified about order status"
                isSwitch
                value={orderUpdates}
                onValueChange={setOrderUpdates}
              />
              <SettingItem
                icon="pricetag-outline"
                title="Promotions & Offers"
                subtitle="Receive deals and discounts"
                isSwitch
                value={promotions}
                onValueChange={setPromotions}
              />
            </View>
          </View>

          {/* PREFERENCES SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.menuBox}>
              <SettingItem
                icon="location-outline"
                title="Location Services"
                subtitle="Allow app to access your location"
                isSwitch
                value={locationServices}
                onValueChange={setLocationServices}
              />
              <SettingItem
                icon="moon-outline"
                title="Dark Mode"
                subtitle="Coming soon"
                isSwitch
                value={darkMode}
                onValueChange={setDarkMode}
                disabled
              />
              <SettingItem
                icon="language-outline"
                title="Language"
                subtitle="English"
                onPress={() => {
                  lightTap();
                  Alert.alert("Language", "Select your preferred language");
                }}
              />
              <SettingItem
                icon="flag-outline"
                title="Country/Region"
                subtitle="Nepal"
                onPress={() => {
                  lightTap();
                  Alert.alert("Region", "Change your region");
                }}
              />
            </View>
          </View>

          {/* ACCOUNT SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuBox}>
              <SettingItem
                icon="key-outline"
                title="Change Password"
                subtitle="Update your account password"
                onPress={() => {
                  lightTap();
                  Alert.alert("Password", "Navigate to change password");
                }}
              />
              <SettingItem
                icon="shield-checkmark-outline"
                title="Privacy & Security"
                subtitle="Manage your privacy settings"
                onPress={() => {
                  lightTap();
                  Alert.alert("Privacy", "Manage privacy settings");
                }}
              />
              <SettingItem
                icon="download-outline"
                title="Download My Data"
                subtitle="Request a copy of your data"
                onPress={() => {
                  lightTap();
                  Alert.alert(
                    "Download Data",
                    "Your data will be emailed to you within 48 hours"
                  );
                }}
              />
              <SettingItem
                icon="trash-outline"
                title="Delete Account"
                subtitle="Permanently delete your account"
                onPress={() => {
                  lightTap();
                  Alert.alert(
                    "Delete Account",
                    "This action cannot be undone. Are you sure?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => Alert.alert("Account deleted"),
                      },
                    ]
                  );
                }}
                isDanger
              />
            </View>
          </View>

          {/* OTHER SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other</Text>
            <View style={styles.menuBox}>
              <SettingItem
                icon="refresh-outline"
                title="Clear Cache"
                subtitle="Free up storage space"
                onPress={() => {
                  lightTap();
                  Alert.alert("Cache Cleared", "App cache has been cleared");
                }}
              />
              <SettingItem
                icon="document-text-outline"
                title="Terms & Conditions"
                onPress={() => {
                  lightTap();
                  router.push("../terms");
                }}
              />
              <SettingItem
                icon="shield-checkmark-outline"
                title="Privacy Policy"
                onPress={() => {
                  lightTap();
                  router.push("../privacy");
                }}
              />
              <SettingItem
                icon="information-circle-outline"
                title="About Sajilo"
                subtitle="Version 1.0.0"
                onPress={() => {
                  lightTap();
                  router.push("../about");
                }}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sajilo Delivery</Text>
            <Text style={styles.footerVersion}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

/* ===== SETTING ITEM COMPONENT ===== */
function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  isSwitch,
  value,
  onValueChange,
  disabled,
  isDanger,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  isDanger?: boolean;
}) {
  const content = (
    <View style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <View
          style={[
            styles.iconBox,
            isDanger && styles.iconBoxDanger,
            disabled && styles.iconBoxDisabled,
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={isDanger ? "#ef4444" : disabled ? "#ccc" : "#2DA8FF"}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.menuText,
              isDanger && styles.menuTextDanger,
              disabled && styles.menuTextDisabled,
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.menuSubtext, disabled && styles.menuTextDisabled]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.menuRight}>
        {isSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: "#ddd", true: "#2DA8FF" }}
            thumbColor="#fff"
            disabled={disabled}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#999" />
        )}
      </View>
    </View>
  );

  if (isSwitch || disabled) {
    return <View>{content}</View>;
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      {content}
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

  placeholder: {
    width: 34,
  },

  scrollContent: {
    paddingBottom: 30,
  },

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

  iconBoxDanger: {
    backgroundColor: "#fee2e2",
  },

  iconBoxDisabled: {
    backgroundColor: "#f5f5f5",
  },

  textContainer: {
    flex: 1,
  },

  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },

  menuTextDanger: {
    color: "#ef4444",
  },

  menuTextDisabled: {
    color: "#ccc",
  },

  menuSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  menuRight: {
    marginLeft: 12,
  },

  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },

  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },

  footerVersion: {
    fontSize: 12,
    color: "#999",
  },
});