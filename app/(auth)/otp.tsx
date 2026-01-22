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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";
import { useOtpTimer } from "../../hooks/useOtpTimer";
import { Ionicons } from "@expo/vector-icons";
import { lightTap, mediumTap } from "@/utils/haptics";
// 🆕 Removed unused Firebase imports

export default function OTPScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const { verifyOTP, phoneNumber, sendOTP } = useAuth();
  const { timeLeft, resetTimer, isExpired } = useOtpTimer(30);
  const inputRefs = useRef<TextInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false); // 🆕 Prevent double submit

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
    ]).start();
  }, []); // ✅ Empty deps is correct here

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOTP = useCallback(
    async () => {
      // 🆕 Prevent double submission
      if (verifyAttempted || loading) return;

      const enteredOtp = otp.join("");

      if (enteredOtp.length < 6) return;
      if (isExpired) {
        mediumTap();
        shakeAnimation();
        Alert.alert("OTP Expired", "Please request a new OTP");
        setOtp(["", "", "", "", "", ""]);
        setVerifyAttempted(false); // 🆕 Reset flag
        inputRefs.current[0]?.focus();
        return;
      }

      setVerifyAttempted(true); // 🆕 Set flag before loading
      setLoading(true);

      try {
        await verifyOTP(enteredOtp);
        // Success - navigation handled in AuthContext
      } catch (err) {
        mediumTap();
        shakeAnimation();
        Alert.alert("Invalid OTP", "Please enter correct OTP");
        setOtp(["", "", "", "", "", ""]);
        setVerifyAttempted(false); // 🆕 Reset flag on error
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [otp, verifyOTP, isExpired, loading, verifyAttempted] // 🆕 Added new deps
  );

  useEffect(() => {
    const enteredOtp = otp.join("");
    // 🆕 Only auto-verify once, when all 6 digits are entered
    if (enteredOtp.length === 6 && !loading && !verifyAttempted) {
      handleVerifyOTP();
    }
  }, [otp, handleVerifyOTP, loading, verifyAttempted]); // 🆕 Added verifyAttempted

  const handleResendOTP = async () => {
    if (!isExpired) return;

    mediumTap();
    setLoading(true);
    setVerifyAttempted(false); // 🆕 Reset flag

    try {
      await sendOTP(phoneNumber);
      setOtp(["", "", "", "", "", ""]);
      resetTimer();
      inputRefs.current[0]?.focus();
      Alert.alert("Success", "OTP has been resent to your number");
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const maskPhone = phoneNumber
    ? phoneNumber.slice(0, 4) +
      " " +
      phoneNumber.slice(4, 6) +
      "XXXXXX" +
      phoneNumber.slice(-2)
    : "+977 98XXXXXXXX";

  const handleBackspace = (index: number) => {
    if (!otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  return (
    <LinearGradient
      colors={["#2DA8FF", "#87CEEB", "#EAF6FF"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              lightTap();
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <Ionicons name="mail-unread" size={48} color="#DC143C" />
          </View>

          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.titleNepali}>प्रमाणीकरण कोड प्रविष्ट गर्नुहोस्</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to
          </Text>
          <Text style={styles.phoneNumber}>{maskPhone}</Text>
        </Animated.View>

        {/* OTP Input Card */}
        <Animated.View
          style={[
            styles.otpCard,
            {
              opacity: fadeAnim,
              transform: [{ translateX: shakeAnim }],
            },
          ]}
        >
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <View key={index} style={styles.otpBoxContainer}>
                <TextInput
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    digit && styles.otpBoxFilled,
                    isExpired && styles.otpBoxExpired,
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  autoFocus={index === 0}
                  selectTextOnFocus
                  onChangeText={(value) => {
                    if (!/^\d?$/.test(value)) return;
                    lightTap();

                    const newOtp = [...otp];
                    newOtp[index] = value;
                    setOtp(newOtp);

                    // Move to next box
                    if (value && index < 5) {
                      inputRefs.current[index + 1]?.focus();
                    }
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace") {
                      handleBackspace(index);
                    }
                  }}
                  editable={!loading}
                />
                {digit && (
                  <View style={styles.filledIndicator}>
                    <Ionicons name="checkmark" size={16} color="#22c55e" />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(otp.filter((d) => d).length / 6) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {otp.filter((d) => d).length}/6 digits entered
            </Text>
          </View>

          {/* Timer Section */}
          {!isExpired ? (
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={20} color="#2DA8FF" />
              <Text style={styles.timerText}>
                Code expires in{" "}
                <Text style={styles.timerValue}>
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </Text>
              </Text>
            </View>
          ) : (
            <View style={styles.expiredContainer}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.expiredText}>Code expired!</Text>
            </View>
          )}
        </Animated.View>

        {/* Loading State */}
        {loading && (
          <Animated.View
            style={[
              styles.loadingContainer,
              { opacity: fadeAnim },
            ]}
          >
            <ActivityIndicator size="large" color="#DC143C" />
            <Text style={styles.loadingText}>Verifying your code...</Text>
            <Text style={styles.loadingTextNepali}>पुष्टि गर्दै...</Text>
          </Animated.View>
        )}

        {/* Resend Section */}
        <Animated.View
          style={[
            styles.resendSection,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.resendQuestion}>Didn't receive the code?</Text>
          {isExpired ? (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOTP}
              disabled={loading}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#DC143C", "#B8001C"]}
                style={styles.resendGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                Resend available in 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Help Section */}
        <Animated.View
          style={[
            styles.helpSection,
            { opacity: fadeAnim },
          ]}
        >
          <View style={styles.helpItem}>
            <Ionicons name="information-circle-outline" size={18} color="#666" />
            <Text style={styles.helpText}>
              Enter the 6-digit code sent to your number
            </Text>
          </View>
          <TouchableOpacity
            style={styles.helpItem}
            onPress={() => {
              lightTap();
              Alert.alert(
                "Need Help?",
                "If you're having trouble receiving the OTP, please check:\n\n• Your network connection\n• Phone number is correct\n• SMS is not blocked\n\nContact support if issue persists."
              );
            }}
          >
            <Ionicons name="help-circle-outline" size={18} color="#2DA8FF" />
            <Text style={styles.helpLink}>Having trouble?</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  backButton: {
    position: "absolute",
    top: 10,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  headerIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
    elevation: 6,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000",
    marginBottom: 6,
    textAlign: "center",
  },

  titleNepali: {
    fontSize: 18,
    fontWeight: "700",
    color: "#DC143C",
    marginBottom: 16,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },

  phoneNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },

  otpCard: {
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

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  otpBoxContainer: {
    position: "relative",
  },

  otpBox: {
    width: 48,
    height: 58,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    borderWidth: 2,
    borderColor: "transparent",
    color: "#000",
  },

  otpBoxFilled: {
    borderColor: "#22c55e",
    backgroundColor: "#F0FDF4",
  },

  otpBoxExpired: {
    borderColor: "#ef4444",
    backgroundColor: "#FEE2E2",
  },

  filledIndicator: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  progressContainer: {
    marginBottom: 16,
  },

  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 2,
  },

  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E0F2FE",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  timerText: {
    fontSize: 14,
    color: "#0369A1",
    fontWeight: "500",
  },

  timerValue: {
    fontWeight: "700",
    color: "#DC143C",
  },

  expiredContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  expiredText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "700",
  },

  loadingContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  loadingTextNepali: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "500",
    color: "#DC143C",
  },

  resendSection: {
    alignItems: "center",
    marginBottom: 20,
  },

  resendQuestion: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontWeight: "500",
  },

  resendButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  resendGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  resendButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  waitingContainer: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  waitingText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },

  helpSection: {
    gap: 12,
  },

  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  helpText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },

  helpLink: {
    fontSize: 13,
    color: "#2DA8FF",
    fontWeight: "600",
  },
});