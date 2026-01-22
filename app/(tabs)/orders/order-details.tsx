import { lightTap, successTap } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// 🆕 PHASE 4: Permission system
import { useAuth } from '@/context/AuthContext';
import { hasPermission, PERMISSIONS } from '@/utils/permissions';


/* ===== PLACEHOLDER IMAGES ===== */
import FoodImage from "../../../assets/images/food-1.jpg";
import RestaurantLogo from "../../../assets/images/user.png";

// Sample order data (replace with actual data from API/props)
const SAMPLE_ORDER = {
  id: "ORD123456",
  status: "preparing", // preparing, on_the_way, delivered, cancelled
  placedAt: "2:30 PM",
  estimatedDelivery: "3:15 PM - 3:30 PM",
  restaurant: {
    name: "Restaurant Lumbini Garden",
    logo: RestaurantLogo,
    phone: "+977-9812345678",
  },
  deliveryPerson: {
    name: "Ram Bahadur",
    phone: "+977-9801234567",
    rating: 4.8,
  },
  items: [
    {
      id: "1",
      name: "Veg Nepali Thali",
      quantity: 2,
      price: 450,
      image: FoodImage,
    },
    {
      id: "2",
      name: "Momo (Veg)",
      quantity: 1,
      price: 180,
      image: FoodImage,
    },
  ],
  deliveryAddress: {
    name: "John Doe",
    phone: "+977-9812345678",
    address: "New Road, Butwal, Rupandehi",
    landmark: "Near City Mall",
  },
  billing: {
    subtotal: 1080,
    deliveryFee: 60,
    serviceFee: 20,
    tax: 54,
    discount: 0,
    total: 1214,
  },
  paymentMethod: "Cash on Delivery",
};

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [order] = useState(SAMPLE_ORDER);

  const getStatusColor = () => {
    switch (order.status) {
      case "preparing":
        return "#f59e0b";
      case "on_the_way":
        return "#3b82f6";
      case "delivered":
        return "#22c55e";
      case "cancelled":
        return "#ef4444";
      default:
        return "#666";
    }
  };

  const getStatusText = () => {
    switch (order.status) {
      case "preparing":
        return "Order is being prepared";
      case "on_the_way":
        return "Order is on the way";
      case "delivered":
        return "Order delivered";
      case "cancelled":
        return "Order cancelled";
      default:
        return "Processing";
    }
  };

  const handleCall = (phone: string) => {
    lightTap();
    Linking.openURL(`tel:${phone}`);
  };

  const handleCancelOrder = () => {
    // 🆕 PHASE 4: Check permission
    if (!hasPermission(userProfile as any, PERMISSIONS.ORDER_CANCEL_OWN)) {
      Alert.alert('Permission Denied', 'You cannot cancel this order at this stage');
      return;
    }

    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            successTap();
            // Handle cancellation logic
            Alert.alert("Order Cancelled", "Your order has been cancelled");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.gradient}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <TouchableOpacity
            onPress={() => {
              lightTap();
              // Navigate to help/support
            }}
          >
            <Ionicons name="help-circle-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ORDER STATUS */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.orderTime}>Placed at {order.placedAt}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() },
                ]}
              >
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            </View>

            {/* ORDER PROGRESS */}
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <View style={styles.progressContainer}>
                <OrderProgress currentStatus={order.status} />
                <Text style={styles.estimatedTime}>
                  Estimated Delivery: {order.estimatedDelivery}
                </Text>
              </View>
            )}
          </View>

          {/* DELIVERY PERSON INFO */}
          {order.status === "on_the_way" && order.deliveryPerson && (
            <View style={styles.deliveryPersonCard}>
              <View style={styles.deliveryPersonInfo}>
                <View style={styles.deliveryPersonAvatar}>
                  <Ionicons name="person" size={30} color="#2DA8FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deliveryPersonName}>
                    {order.deliveryPerson.name}
                  </Text>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={styles.ratingText}>
                      {order.deliveryPerson.rating}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(order.deliveryPerson.phone)}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* RESTAURANT INFO */}
          <View style={styles.restaurantCard}>
            <Image source={order.restaurant.logo} style={styles.restaurantLogo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName}>
                {order.restaurant.name}
              </Text>
              <Text style={styles.restaurantSubtext}>Restaurant Partner</Text>
            </View>
            <TouchableOpacity
              style={styles.phoneBtn}
              onPress={() => handleCall(order.restaurant.phone)}
            >
              <Ionicons name="call-outline" size={20} color="#2DA8FF" />
            </TouchableOpacity>
          </View>

          {/* ORDER ITEMS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item) => (
              <OrderItemCard key={item.id} item={item} />
            ))}
          </View>

          {/* BILL DETAILS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Summary</Text>
            <BillRow label="Subtotal" value={`₹${order.billing.subtotal}`} />
            <BillRow
              label="Delivery Fee"
              value={`₹${order.billing.deliveryFee}`}
            />
            <BillRow
              label="Service Fee"
              value={`₹${order.billing.serviceFee}`}
            />
            <BillRow label="GST (5%)" value={`₹${order.billing.tax}`} />
            {order.billing.discount > 0 && (
              <BillRow
                label="Discount"
                value={`-₹${order.billing.discount}`}
                isDiscount
              />
            )}
            <View style={styles.divider} />
            <BillRow
              label="Total Amount"
              value={`₹${order.billing.total}`}
              bold
            />
            <View style={styles.paymentMethodBox}>
              <Ionicons name="wallet-outline" size={16} color="#666" />
              <Text style={styles.paymentMethodText}>
                {order.paymentMethod}
              </Text>
            </View>
          </View>

          {/* DELIVERY ADDRESS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressBox}>
              <View style={styles.addressIcon}>
                <Ionicons name="location" size={20} color="#2DA8FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressName}>
                  {order.deliveryAddress.name}
                </Text>
                <Text style={styles.addressText}>
                  {order.deliveryAddress.address}
                </Text>
                {order.deliveryAddress.landmark && (
                  <Text style={styles.addressLandmark}>
                    Landmark: {order.deliveryAddress.landmark}
                  </Text>
                )}
                <Text style={styles.addressPhone}>
                  {order.deliveryAddress.phone}
                </Text>
              </View>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          {order.status === "preparing" && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}

          {order.status === "delivered" && (
            <TouchableOpacity
              style={styles.reorderBtn}
              onPress={() => {
                successTap();
                // Handle reorder
              }}
            >
              <Text style={styles.reorderBtnText}>Reorder</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

/* ===== ORDER PROGRESS COMPONENT ===== */
function OrderProgress({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { key: "placed", label: "Placed", icon: "checkmark-circle" },
    { key: "preparing", label: "Preparing", icon: "restaurant" },
    { key: "on_the_way", label: "On the way", icon: "bicycle" },
    { key: "delivered", label: "Delivered", icon: "checkmark-done-circle" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <View style={styles.progressSteps}>
      {steps.map((step, index) => (
        <View key={step.key} style={styles.progressStep}>
          <View
            style={[
              styles.progressDot,
              index <= currentIndex && styles.progressDotActive,
            ]}
          >
            <Ionicons
              name={step.icon as any}
              size={16}
              color={index <= currentIndex ? "#fff" : "#ccc"}
            />
          </View>
          <Text
            style={[
              styles.progressLabel,
              index <= currentIndex && styles.progressLabelActive,
            ]}
          >
            {step.label}
          </Text>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.progressLine,
                index < currentIndex && styles.progressLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

/* ===== ORDER ITEM CARD ===== */
function OrderItemCard({ item }: any) {
  return (
    <View style={styles.orderItem}>
      <Image source={item.image} style={styles.foodImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodQuantity}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.foodPrice}>₹{item.price * item.quantity}</Text>
    </View>
  );
}

/* ===== BILL ROW COMPONENT ===== */
function BillRow({ label, value, bold, isDiscount }: any) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billText, bold && styles.billTextBold]}>
        {label}
      </Text>
      <Text
        style={[
          styles.billText,
          bold && styles.billTextBold,
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

  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  orderId: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  orderTime: {
    fontSize: 12,
    color: "#666",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  progressContainer: {
    marginTop: 8,
  },

  estimatedTime: {
    fontSize: 14,
    color: "#2DA8FF",
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },

  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  progressStep: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },

  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  progressDotActive: {
    backgroundColor: "#2DA8FF",
  },

  progressLabel: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },

  progressLabelActive: {
    color: "#2DA8FF",
    fontWeight: "600",
  },

  progressLine: {
    position: "absolute",
    top: 20,
    left: "50%",
    width: "100%",
    height: 2,
    backgroundColor: "#e5e5e5",
    zIndex: -1,
  },

  progressLineActive: {
    backgroundColor: "#2DA8FF",
  },

  deliveryPersonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  deliveryPersonInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  deliveryPersonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },

  deliveryPersonName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  ratingText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },

  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },

  restaurantCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },

  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },

  restaurantSubtext: {
    fontSize: 12,
    color: "#666",
  },

  phoneBtn: {
    padding: 8,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },

  foodName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  foodQuantity: {
    fontSize: 12,
    color: "#666",
  },

  foodPrice: {
    fontSize: 14,
    fontWeight: "700",
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  billText: {
    fontSize: 14,
    color: "#666",
  },

  billTextBold: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  discountText: {
    color: "#22c55e",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 12,
  },

  paymentMethodBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },

  paymentMethodText: {
    fontSize: 14,
    color: "#666",
  },

  addressBox: {
    flexDirection: "row",
    gap: 12,
  },

  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },

  addressName: {
    fontSize: 14,
    fontWeight: "600",
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

  cancelBtn: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ef4444",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 15,
  },

  cancelBtnText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "700",
  },

  reorderBtn: {
    backgroundColor: "#2DA8FF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 15,
  },

  reorderBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});























































// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";

// /* ===== PLACEHOLDER IMAGES ===== */
// import FoodImage from "../../../assets/images/food-1.jpg";
// import RestaurantLogo from "../../../assets/images/user.png";
// import PhoneIcon from "../../../assets/images/call.png";
// /* ============================== */

// export default function OrderDetailsScreen() {
//   return (
//     <LinearGradient
//       colors={["#2DA8FF", "#EAF6FF"]}
//       style={styles.container}
//     >
//       {/* HEADER */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Order Details</Text>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* RESTAURANT INFO */}
//         <View style={styles.restaurantBox}>
//           <Image source={RestaurantLogo} style={styles.restaurantLogo} />
//           <View style={{ flex: 1 }}>
//             <Text style={styles.restaurantName}>
//               Restaurant Lumbini Garden
//             </Text>
//           </View>
//           <Image source={PhoneIcon} style={styles.phoneIcon} />
//         </View>

//         {/* ORDER ITEMS */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Restaurant</Text>

//           <OrderItem
//             name="Veg Nepali Thali"
//             restaurant="Restaurant Lumbini Garden"
//             price="Rs. 450"
//           />

//           <OrderItem
//             name="Veg Nepali Thali"
//             restaurant="Buddha Kitchen"
//             price="Rs. 380"
//           />
//         </View>

//         {/* BILL DETAILS */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Items</Text>

//           <BillRow label="Subtotal" value="Rs. 830" />
//           <BillRow label="Delivery Charge" value="Rs. 60" />
//           <BillRow label="Service Fee" value="Rs. 20" />

//           <View style={styles.totalRow}>
//             <Text style={styles.totalText}>Total Amount</Text>
//             <Text style={styles.totalPrice}>₹ 910</Text>
//           </View>
//         </View>

//         {/* DELIVERY INFO */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Delivery Info</Text>

//           <View style={styles.deliveryBox}>
//             <Text style={styles.deliveryName}>John Doe</Text>
//             <Text style={styles.deliveryAddress}>
//               New Road, Butwal, Rupandehi
//             </Text>
//           </View>
//         </View>
//       </ScrollView>
//     </LinearGradient>
//   );
// }

// /* ===== REUSABLE COMPONENTS ===== */

// function OrderItem({ name, restaurant, price }: any) {
//   return (
//     <View style={styles.orderItem}>
//       <Image source={FoodImage} style={styles.foodImage} />

//       <View style={{ flex: 1 }}>
//         <Text style={styles.foodName}>{name}</Text>
//         <Text style={styles.foodRestaurant}>{restaurant}</Text>
//       </View>

//       <Text style={styles.foodPrice}>{price}</Text>
//     </View>
//   );
// }

// function BillRow({ label, value }: any) {
//   return (
//     <View style={styles.billRow}>
//       <Text style={styles.billText}>{label}</Text>
//       <Text style={styles.billText}>{value}</Text>
//     </View>
//   );
// }

// /* ===== STYLES ===== */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 50,
//   },

//   header: {
//     paddingHorizontal: 20,
//     marginBottom: 10,
//   },

//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//   },

//   restaurantBox: {
//     backgroundColor: "#fff",
//     marginHorizontal: 15,
//     borderRadius: 16,
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },

//   restaurantLogo: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 10,
//   },

//   restaurantName: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },

//   phoneIcon: {
//     width: 22,
//     height: 22,
//   },

//   section: {
//     backgroundColor: "#fff",
//     marginHorizontal: 15,
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 15,
//   },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   orderItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },

//   foodImage: {
//     width: 55,
//     height: 55,
//     borderRadius: 10,
//     marginRight: 10,
//   },

//   foodName: {
//     fontSize: 14,
//     fontWeight: "bold",
//   },

//   foodRestaurant: {
//     fontSize: 12,
//     color: "#666",
//   },

//   foodPrice: {
//     fontSize: 14,
//     fontWeight: "bold",
//   },

//   billRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 6,
//   },

//   billText: {
//     fontSize: 14,
//   },

//   totalRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#eee",
//     paddingTop: 10,
//   },

//   totalText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#DC143C",
//   },

//   totalPrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#DC143C",
//   },

//   deliveryBox: {
//     marginTop: 6,
//   },

//   deliveryName: {
//     fontSize: 14,
//     fontWeight: "bold",
//   },

//   deliveryAddress: {
//     fontSize: 13,
//     color: "#555",
//     marginTop: 4,
//   },
// });
