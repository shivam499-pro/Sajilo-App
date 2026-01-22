import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import { lightTap, mediumTap } from "@/utils/haptics";

// 🆕 Removed unused imports: PhoneAuthProvider, signInWithCredential

export default function LoginScreen() {
  const { sendOTP } = useAuth();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]); // 🆕 Added dependency array

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      lightTap();
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit phone number"
      );
      return;
    }

    mediumTap();
    setLoading(true);

    try {
      const fullNumber = `+977${phone}`;
      await sendOTP(fullNumber);
      
      // 🆕 Add delay before navigation for better UX
      setTimeout(() => {
        router.push("/(auth)/otp");
      }, 300);
    } catch (error: any) {
      console.error("OTP send error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || phone.length !== 10;

  return (
    <LinearGradient
      colors={["#2DA8FF", "#87CEEB", "#EAF6FF"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="fast-food" size={60} color="#DC143C" />
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeText}>🇳🇵</Text>
            </View>
          </View>

          <Text style={styles.appName}>Sajilo Delivery</Text>
          <Text style={styles.appNameNepali}>सजिलो डेलिभरी</Text>
          <Text style={styles.tagline}>Welcome to Bhairahawa's #1 Food App</Text>
        </Animated.View>

        {/* Login Card */}
        <Animated.View
          style={[
            styles.loginCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="phone-portrait-outline" size={28} color="#DC143C" />
            <Text style={styles.cardTitle}>Login with Phone</Text>
          </View>

          <Text style={styles.cardSubtitle}>
            Enter your mobile number to get started
          </Text>
          <Text style={styles.cardSubtitleNepali}>
            सुरु गर्न आफ्नो मोबाइल नम्बर प्रविष्ट गर्नुहोस्
          </Text>

          {/* Phone Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View
              style={[
                styles.inputContainer,
                phone.length === 10 && styles.inputContainerValid,
              ]}
            >
              <View style={styles.countryCodeContainer}>
                <Text style={styles.flag}>🇳🇵</Text>
                <Text style={styles.countryCode}>+977</Text>
              </View>

              <View style={styles.inputDivider} />

              <TextInput
                placeholder="98XXXXXXXX"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                style={styles.input}
                value={phone}
                onChangeText={(text) => {
                  if (/^\d*$/.test(text) && text.length <= 10) {
                    lightTap();
                    setPhone(text);
                  }
                }}
                maxLength={10}
                editable={!loading}
                autoFocus
              />

              {phone.length === 10 && (
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
              )}
            </View>

            {/* Character Counter */}
            <Text
              style={[
                styles.charCounter,
                phone.length === 10 && styles.charCounterValid,
              ]}
            >
              {phone.length}/10 digits
            </Text>
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[
              styles.button,
              isButtonDisabled && styles.buttonDisabled,
            ]}
            onPress={handleSendOTP}
            disabled={isButtonDisabled}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isButtonDisabled
                  ? ["#ccc", "#999"]
                  : ["#DC143C", "#B8001C"]
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.buttonText}>Sending...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Send OTP</Text>
                  <Text style={styles.buttonTextNepali}>OTP पठाउनुहोस्</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              We'll send you a 6-digit verification code
            </Text>
          </View>
        </Animated.View>

        {/* Features Section */}
        <Animated.View
          style={[
            styles.featuresSection,
            { opacity: fadeAnim },
          ]}
        >
          <FeatureItem icon="flash-outline" text="Fast Delivery" />
          <FeatureItem icon="shield-checkmark-outline" text="Secure" />
          <FeatureItem icon="time-outline" text="24/7 Support" />
        </Animated.View>

        {/* Footer */}
        <Animated.View
          style={[
            styles.footer,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.footerText}>
            By continuing, you agree to our
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() => {
                lightTap();
                Alert.alert("Terms", "Terms & Conditions");
              }}
            >
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> & </Text>
            <TouchableOpacity
              onPress={() => {
                lightTap();
                Alert.alert("Privacy", "Privacy Policy");
              }}
            >
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ===== FEATURE ITEM COMPONENT ===== */
function FeatureItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color="#DC143C" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

/* ===== STYLES ===== */
// 🆕 Shadow style constant to avoid duplication
const COMMON_SHADOW = {
  elevation: 3,
  shadowColor: "#000" as const,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 5,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 15,
    elevation: 8,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: "relative",
  },

  iconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    ...COMMON_SHADOW, // 🆕 Using constant
  },

  iconBadgeText: {
    fontSize: 22,
  },

  appName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
  },

  appNameNepali: {
    fontSize: 20,
    fontWeight: "700",
    color: "#DC143C",
    marginBottom: 8,
  },

  tagline: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },

  loginCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },

  cardSubtitleNepali: {
    fontSize: 13,
    color: "#DC143C",
    marginBottom: 20,
    fontWeight: "500",
  },

  inputSection: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },

  inputContainerValid: {
    borderColor: "#22c55e",
    backgroundColor: "#F0FDF4",
  },

  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },

  flag: {
    fontSize: 24,
  },

  countryCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },

  inputDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#ddd",
    marginHorizontal: 12,
  },

  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    paddingVertical: 10,
  },

  charCounter: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    textAlign: "right",
  },

  charCounterValid: {
    color: "#22c55e",
    fontWeight: "600",
  },

  button: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    marginBottom: 16,
  },

  buttonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },

  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  buttonTextNepali: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#2DA8FF",
  },

  infoText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },

  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },

  featureItem: {
    alignItems: "center",
    gap: 6,
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    ...COMMON_SHADOW, // 🆕 Using constant
  },

  featureText: {
    fontSize: 11,
    color: "#333",
    fontWeight: "600",
  },

  footer: {
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    color: "#666",
  },

  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  footerLink: {
    fontSize: 12,
    color: "#2DA8FF",
    fontWeight: "600",
  },
});