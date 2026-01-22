import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "@/context/CartContext";
import { successTap, lightTap } from "@/utils/haptics";

// Sample data (replace with actual data passed from previous screens)
const SELECTED_ADDRESS = {
  label: "Home",
  address: "Bhairahawa, Bank Road",
  landmark: "Near City Mall",
  phone: "+977-9812345678",
};

const PAYMENT_METHOD = {
  label: "Cash on Delivery",
  icon: "cash",
};

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { cartItems } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Calculate totals
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = itemTotal > 0 ? 40 : 0;
  const platformFee = itemTotal > 0 ? 5 : 0;
  const tax = itemTotal * 0.05;
  const discount = 0; // Add coupon logic if needed
  const grandTotal = itemTotal + deliveryFee + platformFee + tax - discount;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);

    // Simulate API call
    setTimeout(() => {
      setIsPlacingOrder(false);
      successTap();
      
      // Clear cart
      
      // Navigate to success screen
      router.replace("../order-success");
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.gradient}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Summary</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* PROGRESS INDICATOR */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, styles.progressStepComplete]}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
            <View style={[styles.progressLine, styles.progressLineActive]} />
            <View style={[styles.progressStep, styles.progressStepComplete]}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
            <View style={[styles.progressLine, styles.progressLineActive]} />
            <View style={[styles.progressStep, styles.progressStepActive]}>
              <Text style={styles.progressNumber}>3</Text>
            </View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelComplete}>Address</Text>
            <Text style={styles.progressLabelComplete}>Payment</Text>
            <Text style={styles.progressLabel}>Summary</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* DELIVERY ADDRESS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity
                onPress={() => {
                  lightTap();
                  router.back();
                  router.back();
                }}
              >
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.addressCard}>
              <View style={styles.addressIconBox}>
                <Ionicons name="location" size={20} color="#2DA8FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>{SELECTED_ADDRESS.label}</Text>
                <Text style={styles.addressText}>{SELECTED_ADDRESS.address}</Text>
                <Text style={styles.addressLandmark}>
                  {SELECTED_ADDRESS.landmark}
                </Text>
                <Text style={styles.addressPhone}>{SELECTED_ADDRESS.phone}</Text>
              </View>
            </View>
          </View>

          {/* PAYMENT METHOD */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <TouchableOpacity
                onPress={() => {
                  lightTap();
                  router.back();
                }}
              >
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.paymentCard}>
              <View style={styles.paymentIconBox}>
                <Ionicons name={PAYMENT_METHOD.icon as any} size={20} color="#2DA8FF" />
              </View>
              <Text style={styles.paymentText}>{PAYMENT_METHOD.label}</Text>
            </View>
          </View>

          {/* ORDER ITEMS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <View style={styles.itemsBox}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Image source={item.image} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    ₹{item.price * item.quantity}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* BILL DETAILS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            <View style={styles.billBox}>
              <BillRow label="Item Total" value={`₹${itemTotal}`} />
              <BillRow label="Delivery Fee" value={`₹${deliveryFee}`} />
              <BillRow label="Platform Fee" value={`₹${platformFee}`} />
              <BillRow label="GST (5%)" value={`₹${tax.toFixed(0)}`} />
              {discount > 0 && (
                <BillRow
                  label="Discount"
                  value={`-₹${discount}`}
                  isDiscount
                />
              )}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>To Pay</Text>
                <Text style={styles.totalValue}>₹{grandTotal.toFixed(0)}</Text>
              </View>
            </View>
          </View>

          {/* INSTRUCTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Instructions</Text>
            <TouchableOpacity style={styles.instructionCard}>
              <Ionicons name="document-text-outline" size={20} color="#666" />
              <Text style={styles.instructionText}>
                Add cooking instructions (Optional)
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* CANCELLATION POLICY */}
          <View style={styles.policyBox}>
            <Ionicons name="information-circle-outline" size={18} color="#666" />
            <Text style={styles.policyText}>
              Orders cannot be cancelled once packed for delivery. In case of
              unexpected delays, a refund will be provided.
            </Text>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* BOTTOM BAR */}
        <View style={styles.bottomBar}>
          <View style={styles.totalSection}>
            <Text style={styles.bottomTotalLabel}>Total Amount</Text>
            <Text style={styles.bottomTotalValue}>₹{grandTotal.toFixed(0)}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.placeOrderBtn,
              isPlacingOrder && styles.placeOrderBtnDisabled,
            ]}
            onPress={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? (
              <Text style={styles.placeOrderText}>Placing Order...</Text>
            ) : (
              <>
                <Text style={styles.placeOrderText}>Place Order</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ===== BILL ROW COMPONENT ===== */
function BillRow({
  label,
  value,
  isDiscount,
}: {
  label: string;
  value: string;
  isDiscount?: boolean;
}) {
  return (
    <View style={styles.billRow}>
      <Text style={styles.billLabel}>{label}</Text>
      <Text style={[styles.billValue, isDiscount && styles.discountValue]}>
        {value}
      </Text>
    </View>
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

  progressNumber: {
    color: "#fff",
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

  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  // Section
  section: {
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  changeText: {
    fontSize: 14,
    color: "#2DA8FF",
    fontWeight: "600",
  },

  // Address Card
  addressCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  addressIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },

  addressLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  addressText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },

  addressLandmark: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },

  addressPhone: {
    fontSize: 12,
    color: "#2DA8FF",
    fontWeight: "600",
  },

  // Payment Card
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  paymentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },

  paymentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },

  // Items Box
  itemsBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },

  itemDetails: {
    flex: 1,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  itemQuantity: {
    fontSize: 12,
    color: "#666",
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },

  // Bill Box
  billBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  billLabel: {
    fontSize: 14,
    color: "#666",
  },

  billValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },

  discountValue: {
    color: "#22c55e",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2DA8FF",
  },

  // Instructions
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },

  // Policy Box
  policyBox: {
    flexDirection: "row",
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "#ffc107",
  },

  policyText: {
    flex: 1,
    fontSize: 12,
    color: "#856404",
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
    gap: 12,
  },

  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bottomTotalLabel: {
    fontSize: 14,
    color: "#666",
  },

  bottomTotalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  placeOrderBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  placeOrderBtnDisabled: {
    backgroundColor: "#ccc",
  },

  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});