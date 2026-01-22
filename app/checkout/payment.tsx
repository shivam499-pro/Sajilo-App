import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { lightTap, successTap } from "@/utils/haptics";

type PaymentMethod = "COD" | "ESEWA" | "KHALTI" | "CARD";

// Payment methods data
const PAYMENT_METHODS = [
  {
    id: "COD",
    label: "Cash on Delivery",
    icon: "cash",
    description: "Pay when you receive",
    recommended: true,
  },
  {
    id: "ESEWA",
    label: "eSewa",
    icon: "wallet",
    description: "Digital payment wallet",
    recommended: false,
  },
  {
    id: "KHALTI",
    label: "Khalti",
    icon: "card",
    description: "Digital payment wallet",
    recommended: false,
  },
  {
    id: "CARD",
    label: "Credit/Debit Card",
    icon: "card-outline",
    description: "Visa, Mastercard, etc.",
    recommended: false,
  },
];

export default function PaymentScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("COD");

  const handleContinue = () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    successTap();

    // If online payment, show payment processing
    if (selectedMethod !== "COD") {
      Alert.alert(
        "Payment Processing",
        `Processing payment via ${selectedMethod}...`,
        [
          {
            text: "OK",
            onPress: () => router.push("/checkout/summary"),
          },
        ]
      );
    } else {
      // Navigate to summary
      router.push("/checkout/summary");
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
          <Text style={styles.headerTitle}>Payment Method</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* PROGRESS INDICATOR */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, styles.progressStepComplete]}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
            <View style={[styles.progressLine, styles.progressLineActive]} />
            <View style={[styles.progressStep, styles.progressStepActive]}>
              <Text style={styles.progressNumber}>2</Text>
            </View>
            <View style={[styles.progressLine, styles.progressLineInactive]} />
            <View style={[styles.progressStep, styles.progressStepInactive]}>
              <Text style={styles.progressNumberInactive}>3</Text>
            </View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelComplete}>Address</Text>
            <Text style={styles.progressLabel}>Payment</Text>
            <Text style={styles.progressLabelInactive}>Summary</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* INFO BOX */}
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
            <Text style={styles.infoText}>
              Your payment information is safe and secure
            </Text>
          </View>

          {/* PAYMENT METHODS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Payment Method</Text>
            {PAYMENT_METHODS.map((method) => (
              <PaymentOption
                key={method.id}
                method={method}
                selected={selectedMethod === method.id}
                onSelect={() => {
                  lightTap();
                  setSelectedMethod(method.id as PaymentMethod);
                }}
              />
            ))}
          </View>

          {/* PAYMENT SECURITY INFO */}
          <View style={styles.securityBox}>
            <View style={styles.securityHeader}>
              <Ionicons name="lock-closed" size={18} color="#666" />
              <Text style={styles.securityTitle}>100% Safe & Secure</Text>
            </View>
            <Text style={styles.securityText}>
              All your transactions are encrypted and secure. We do not store
              your payment information.
            </Text>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* BOTTOM BAR */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>Continue to Summary</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ===== PAYMENT OPTION COMPONENT ===== */
function PaymentOption({
  method,
  selected,
  onSelect,
}: {
  method: any;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.paymentCard, selected && styles.paymentCardActive]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.paymentCardContent}>
        <View
          style={[
            styles.paymentIconBox,
            selected && styles.paymentIconBoxActive,
          ]}
        >
          <Ionicons
            name={method.icon}
            size={24}
            color={selected ? "#fff" : "#2DA8FF"}
          />
        </View>

        <View style={styles.paymentInfo}>
          <View style={styles.paymentLabelRow}>
            <Text style={styles.paymentLabel}>{method.label}</Text>
            {method.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
          </View>
          <Text style={styles.paymentDescription}>{method.description}</Text>
        </View>
      </View>

      {/* RADIO BUTTON */}
      <View style={[styles.radio, selected && styles.radioActive]}>
        {selected && <View style={styles.radioDot} />}
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

  // Progress Indicator
  progressContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  progressStepComplete: {
    backgroundColor: "#22c55e",
  },

  progressStepActive: {
    backgroundColor: "#2DA8FF",
  },

  progressStepInactive: {
    backgroundColor: "#e5e5e5",
  },

  progressNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  progressNumberInactive: {
    color: "#999",
    fontSize: 16,
    fontWeight: "700",
  },

  progressLine: {
    width: 60,
    height: 2,
  },

  progressLineActive: {
    backgroundColor: "#22c55e",
  },

  progressLineInactive: {
    backgroundColor: "#e5e5e5",
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },

  progressLabel: {
    fontSize: 12,
    color: "#2DA8FF",
    fontWeight: "600",
  },

  progressLabelComplete: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "600",
  },

  progressLabelInactive: {
    fontSize: 12,
    color: "#999",
  },

  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  // Info Box
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#86efac",
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#15803d",
  },

  // Section
  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },

  // Payment Card
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  paymentCardActive: {
    borderColor: "#2DA8FF",
    backgroundColor: "#f0f9ff",
  },

  paymentCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  paymentIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },

  paymentIconBoxActive: {
    backgroundColor: "#2DA8FF",
  },

  paymentInfo: {
    flex: 1,
  },

  paymentLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  paymentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  recommendedBadge: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  recommendedText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },

  paymentDescription: {
    fontSize: 13,
    color: "#666",
  },

  radio: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },

  radioActive: {
    borderColor: "#2DA8FF",
  },

  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2DA8FF",
  },

  // Security Box
  securityBox: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e7",
  },

  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  securityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  securityText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  continueBtn: {
    backgroundColor: "#2DA8FF",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});