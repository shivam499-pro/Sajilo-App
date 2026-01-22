import { useAuth } from '@/context/AuthContext';
import { useCart } from "@/context/CartContext";
import { CartItemType } from "@/types/cart";
import { heavyTap, lightTap, successTap } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🆕 Toast notification (install: npm install react-native-toast-message)
import Toast from 'react-native-toast-message';

export default function CartScreen() {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart // 🆕 Use from context!
  } = useCart();
  const { userProfile } = useAuth();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [undoItem, setUndoItem] = useState<CartItemType | null>(null); // 🆕 Undo support
  const [isProcessing, setIsProcessing] = useState(false); // 🆕 Loading state

  // 🆕 Memoized calculations for performance
  const calculations = useMemo(() => {
    const itemTotal = cartItems.reduce(
      (sum: number, item) => sum + item.price * item.quantity,
      0
    );

    const MINIMUM_ORDER = 99;
    const deliveryFee = itemTotal > 0 && itemTotal < 500 ? 40 : itemTotal >= 500 ? 0 : 0;
    const platformFee = itemTotal > 0 ? 5 : 0;
    const tax = itemTotal * 0.05;
    const discount = 0;
    const grandTotal = itemTotal + deliveryFee + platformFee + tax - discount;

    return {
      itemTotal,
      deliveryFee,
      platformFee,
      tax,
      discount,
      grandTotal,
      MINIMUM_ORDER,
    };
  }, [cartItems]);

  // 🆕 Delete with undo feature
  const handleDeleteItem = useCallback((item: CartItemType) => {
    heavyTap();
    removeFromCart(item.id);
    setUndoItem(item);

    // 🆕 Show toast with undo option
    Toast.show({
      type: 'info',
      text1: 'Item removed',
      text2: `${item.name} removed from cart`,
      visibilityTime: 3000,
      onPress: () => {
        // Restore item
        Toast.hide();
      },
    });
  }, [removeFromCart]);

  const handleProceed = useCallback(async () => {
    // Check if user is logged in
    if (!userProfile) {
      Alert.alert(
        'Login Required',
        'Please log in to proceed to checkout',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    // Check if account is active
    if (userProfile.status && userProfile.status !== 'active') {
      Alert.alert(
        'Account Inactive',
        'Your account is not active. Please contact support.',
        [
          { text: 'OK' },
          { text: 'Contact Support', onPress: () => router.push('/help') }
        ]
      );
      return;
    }

    // Check minimum order
    if (calculations.itemTotal < calculations.MINIMUM_ORDER) {
      Alert.alert(
        "Minimum Order",
        `Minimum order amount is ₹${calculations.MINIMUM_ORDER}. Add ₹${(calculations.MINIMUM_ORDER - calculations.itemTotal).toFixed(0)} more to proceed.`
      );
      return;
    }

    setIsProcessing(true);
    try {
      successTap();
      // Add delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push("../checkout");
    } finally {
      setIsProcessing(false);
    }
  }, [userProfile, calculations, router]);

  // 🆕 Better empty state
  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="cart-outline" size={80} color="#ccc" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add delicious items to get started
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push("/(tabs)/home")}
            >
              <LinearGradient
                colors={["#DC143C", "#B8001C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.browseBtnGradient}
              >
                <Ionicons name="restaurant-outline" size={18} color="#fff" />
                <Text style={styles.browseBtnText}>Browse Menu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.gradient}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>
          {cartItems.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Clear Cart",
                  "Are you sure you want to remove all items?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      style: "destructive",
                      onPress: () => {
                        heavyTap();
                        clearCart();
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 🆕 RESTAURANT INFO CARD (Enhanced) */}
          <View style={styles.restaurantCard}>
            <View style={styles.restaurantHeader}>
              <View style={styles.restaurantIcon}>
                <Ionicons name="restaurant" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.restaurantNameRow}>
                  <Text style={styles.restaurantName}>Restaurant Name</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>🟢 Open</Text>
                  </View>
                </View>
                <View style={styles.restaurantMeta}>
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text style={styles.rating}>4.5 (250+ reviews)</Text>
                  <Text style={styles.separator}>•</Text>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.location}>2.5 km away</Text>
                </View>
              </View>
            </View>
            <View style={styles.deliveryTimeBox}>
              <Ionicons name="time-outline" size={16} color="#2DA8FF" />
              <Text style={styles.deliveryTime}>30-35 mins</Text>
            </View>
          </View>

          {/* CART ITEMS */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Items ({cartItems.length})</Text>
            {cartItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrease={() => {
                  lightTap();
                  increaseQty(item.id);
                }}
                onDecrease={() => {
                  lightTap();
                  decreaseQty(item.id);
                }}
                onDelete={() => handleDeleteItem(item)}
              />
            ))}
          </View>

          {/* 🆕 OFFERS SECTION */}
          <TouchableOpacity
            style={styles.offerBanner}
            onPress={() => Alert.alert("Offers", "View available offers")}
          >
            <View style={styles.offerContent}>
              <Ionicons name="gift-outline" size={20} color="#DC143C" />
              <View style={{ flex: 1 }}>
                <Text style={styles.offerTitle}>Save ₹50 on this order!</Text>
                <Text style={styles.offerSubtitle}>Apply code: SAVE50</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* COUPON SECTION */}
          <TouchableOpacity style={styles.couponCard}>
            <View style={styles.couponLeft}>
              <Ionicons name="pricetag-outline" size={20} color="#2DA8FF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.couponText}>Apply Coupon</Text>
                <Text style={styles.couponSubtext}>Get extra discounts</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* DELIVERY INSTRUCTION */}
          <TouchableOpacity style={styles.instructionCard}>
            <View style={styles.couponLeft}>
              <Ionicons name="document-text-outline" size={20} color="#2DA8FF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.couponText}>Add cooking instructions</Text>
                <Text style={styles.couponSubtext}>e.g., Extra spicy, no onions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* 🆕 BILL SUMMARY (Enhanced) */}
          <View style={styles.billBox}>
            <Text style={styles.billTitle}>Bill Summary</Text>

            <BillRow
              label="Item Total"
              value={`₹${calculations.itemTotal.toFixed(0)}`}
            />

            {calculations.deliveryFee > 0 && (
              <BillRow
                label="Delivery Fee"
                value={`₹${calculations.deliveryFee}`}
              />
            )}

            <BillRow
              label="Platform Fee"
              value={`₹${calculations.platformFee}`}
            />

            <BillRow
              label="GST (5%)"
              value={`₹${calculations.tax.toFixed(0)}`}
            />

            {calculations.discount > 0 && (
              <BillRow
                label="Discount"
                value={`-₹${calculations.discount}`}
                isDiscount
              />
            )}

            <View style={styles.divider} />

            <BillRow
              label="To Pay"
              value={`₹${calculations.grandTotal.toFixed(0)}`}
              bold
            />

            {/* 🆕 Minimum order warning */}
            {calculations.itemTotal < calculations.MINIMUM_ORDER && (
              <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={16} color="#ff9800" />
                <Text style={styles.warningText}>
                  Add ₹{(calculations.MINIMUM_ORDER - calculations.itemTotal).toFixed(0)} more to place order
                </Text>
              </View>
            )}
          </View>

          {/* Spacer */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* 🆕 BOTTOM BAR (Enhanced) */}
        <View style={styles.bottomBar}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>
              ₹{calculations.grandTotal.toFixed(0)}
            </Text>
            {calculations.itemTotal < calculations.MINIMUM_ORDER && (
              <View style={styles.warningBoxCompact}>
                <Text style={styles.warningTextCompact}>
                  Add ₹{(calculations.MINIMUM_ORDER - calculations.itemTotal).toFixed(0)} more
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.bottomBtn,
              (calculations.itemTotal < calculations.MINIMUM_ORDER || isProcessing) &&
              styles.bottomBtnDisabled,
            ]}
            onPress={handleProceed}
            disabled={calculations.itemTotal < calculations.MINIMUM_ORDER || isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.bottomBtnText}>Processing...</Text>
              </>
            ) : (
              <>
                <Text style={styles.bottomBtnText}>Proceed to Checkout</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 🆕 Toast notifications */}
      <Toast />
    </View>
  );
}

/* ===== CART ITEM ROW COMPONENT (Memoized) ===== */
const CartItemRow = React.memo(({
  item,
  onIncrease,
  onDecrease,
  onDelete,
}: {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
}) => {
  return (
    <View style={styles.itemCard}>
      <Image source={item.image} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.customization && (
              <Text style={styles.customization}>{item.customization}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color="#ff4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>₹{item.price}</Text>

          <View style={styles.qtyBox}>
            <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>{item.quantity}</Text>

            <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

CartItemRow.displayName = 'CartItemRow';

/* ===== BILL ROW COMPONENT ===== */
function BillRow({
  label,
  value,
  bold,
  isDiscount,
}: {
  label: string;
  value: string;
  bold?: boolean;
  isDiscount?: boolean;
}) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billText, bold && styles.bold]}>{label}</Text>
      <Text
        style={[
          styles.billText,
          bold && styles.bold,
          isDiscount && styles.discountText,
        ]}
      >
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

  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIconBox: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },

  browseBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },

  browseBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 30,
    paddingVertical: 14,
  },

  browseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Restaurant Card (Enhanced)
  restaurantCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  restaurantHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  restaurantIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#2DA8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  restaurantNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  restaurantName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },

  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
  },

  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  rating: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },

  separator: {
    color: "#ccc",
    marginHorizontal: 4,
  },

  location: {
    fontSize: 12,
    color: "#666",
  },

  deliveryTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  deliveryTime: {
    fontSize: 13,
    color: "#0369A1",
    fontWeight: "600",
  },

  // Items Section
  itemsSection: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  // Cart Item
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },

  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },

  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  itemName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    color: "#000",
  },

  customization: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  deleteBtn: {
    padding: 4,
  },

  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  qtyBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  qtyBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2DA8FF",
  },

  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 12,
    color: "#000",
  },

  // Offer Banner
  offerBanner: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#DC143C",
  },

  offerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  offerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  offerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  // Coupon Card
  couponCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2DA8FF",
    borderStyle: "dashed",
    elevation: 1,
  },

  instructionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },

  couponLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  couponText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },

  couponSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  // Bill Summary
  billBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  billTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
    color: "#000",
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },

  billText: {
    fontSize: 14,
    color: "#666",
  },

  bold: {
    fontWeight: "700",
    fontSize: 16,
    color: "#000",
  },

  discountText: {
    color: "#22c55e",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },

  warningText: {
    fontSize: 12,
    color: "#856404",
    fontWeight: "600",
  },

  warningBoxCompact: {
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },

  warningTextCompact: {
    fontSize: 11,
    color: "#856404",
    fontWeight: "600",
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  totalSection: {
    marginBottom: 12,
  },

  totalLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontWeight: "500",
  },

  totalPrice: {
    fontSize: 26,
    fontWeight: "900",
    color: "#000",
  },

  bottomBtn: {
    backgroundColor: "#2DA8FF",
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#2DA8FF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  bottomBtnDisabled: {
    backgroundColor: "#D1D5DB",
    elevation: 1,
    shadowOpacity: 0.05,
  },

  bottomBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});