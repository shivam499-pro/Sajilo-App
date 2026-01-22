import { lightTap, successTap } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// 🆕 PHASE 4: Optional - for defensive coding
import { useAuth } from '@/context/AuthContext';
import { hasPermission, PERMISSIONS } from '@/utils/permissions';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    successTap();

    // Start animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.container}>
      <Animated.View
        style={[
          styles.successCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* SUCCESS ICON */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={60} color="#fff" />
          </View>
        </View>

        <Text style={styles.successTitle}>Order Placed Successfully!</Text>

        <Text style={styles.successSubtitle}>
          Your delicious food is being prepared and will be delivered soon.
        </Text>

        {/* ORDER INFO */}
        <View style={styles.infoBox}>
          <InfoRow
            icon="receipt-outline"
            label="Order ID"
            value="#SJ10234"
          />
          <InfoRow
            icon="time-outline"
            label="Estimated Delivery"
            value="30-35 mins"
          />
          <InfoRow
            icon="wallet-outline"
            label="Payment"
            value="Cash on Delivery"
          />
          <InfoRow
            icon="cash-outline"
            label="Total Amount"
            value="₹910"
            highlight
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // 🆕 PHASE 4: Defensive check (optional)
            if (!hasPermission(userProfile as any, PERMISSIONS.ORDER_VIEW_OWN)) {
              Alert.alert('Error', 'Cannot track order. Please log in again.');
              router.push('/(auth)/login');
              return;
            }

            lightTap();
            router.push("../order-details");
          }}
        >
          <Text style={styles.primaryText}>Track Order</Text>
          <Ionicons name="location" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            lightTap();
            router.push("/");
          }}
        >
          <Text style={styles.secondaryText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* CONFETTI EFFECT */}
      <View style={styles.confettiContainer}>
        <Ionicons
          name="sparkles"
          size={30}
          color="#fbbf24"
          style={[styles.confetti, { top: 100, left: 50 }]}
        />
        <Ionicons
          name="sparkles"
          size={25}
          color="#f472b6"
          style={[styles.confetti, { top: 120, right: 60 }]}
        />
        <Ionicons
          name="star"
          size={20}
          color="#60a5fa"
          style={[styles.confetti, { bottom: 200, left: 70 }]}
        />
        <Ionicons
          name="star"
          size={28}
          color="#34d399"
          style={[styles.confetti, { bottom: 220, right: 50 }]}
        />
        <Ionicons
          name="heart"
          size={22}
          color="#fb7185"
          style={[styles.confetti, { top: 250, left: 40 }]}
        />
        <Ionicons
          name="heart"
          size={18}
          color="#c084fc"
          style={[styles.confetti, { top: 280, right: 80 }]}
        />
      </View>
    </LinearGradient>
  );
}

/* ===== INFO ROW COMPONENT ===== */
function InfoRow({ icon, label, value, highlight }: any) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons
          name={icon}
          size={18}
          color={highlight ? "#2DA8FF" : "#666"}
        />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  successCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  successIconContainer: {
    marginBottom: 24,
  },

  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
    textAlign: "center",
  },

  successSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  infoBox: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  infoLabel: {
    fontSize: 14,
    color: "#666",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },

  infoValueHighlight: {
    fontSize: 16,
    color: "#2DA8FF",
    fontWeight: "700",
  },

  primaryButton: {
    backgroundColor: "#2DA8FF",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#2DA8FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: "#2DA8FF",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryText: {
    color: "#2DA8FF",
    fontSize: 16,
    fontWeight: "700",
  },

  confettiContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },

  confetti: {
    position: "absolute",
    opacity: 0.6,
  },
});
