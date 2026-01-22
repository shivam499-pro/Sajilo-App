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

// Sample addresses (replace with actual data from API/storage)
const SAVED_ADDRESSES = [
  {
    id: "1",
    type: "home",
    label: "Home",
    icon: "home",
    address: "Bhairahawa, Bank Road",
    landmark: "Near City Mall",
    phone: "+977-9812345678",
    isDefault: true,
  },
  {
    id: "2",
    type: "office",
    label: "Office",
    icon: "business",
    address: "Siddharthanagar, Tech Park",
    landmark: "Block B, 3rd Floor",
    phone: "+977-9801234567",
    isDefault: false,
  },
  {
    id: "3",
    type: "other",
    label: "Friend's Place",
    icon: "location",
    address: "New Road, Butwal",
    landmark: "Near Buspark",
    phone: "+977-9823456789",
    isDefault: false,
  },
];

export default function AddressScreen() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(
    SAVED_ADDRESSES.find((addr) => addr.isDefault)?.id || SAVED_ADDRESSES[0].id
  );

  const handleContinue = () => {
    const selected = SAVED_ADDRESSES.find((addr) => addr.id === selectedAddress);
    if (!selected) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }
    successTap();
    // Navigate to payment screen
    router.push("/checkout/payment");
  };

  const handleAddAddress = () => {
    lightTap();
    // Navigate to add address screen
    router.push("../add-address");
  };

  const handleEditAddress = (addressId: string) => {
    lightTap();
    // Navigate to edit address screen
    router.push(`../edit-address/${addressId}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.gradient}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Address</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* PROGRESS INDICATOR */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, styles.progressStepActive]}>
              <Text style={styles.progressNumber}>1</Text>
            </View>
            <View style={[styles.progressLine, styles.progressLineInactive]} />
            <View style={[styles.progressStep, styles.progressStepInactive]}>
              <Text style={styles.progressNumberInactive}>2</Text>
            </View>
            <View style={[styles.progressLine, styles.progressLineInactive]} />
            <View style={[styles.progressStep, styles.progressStepInactive]}>
              <Text style={styles.progressNumberInactive}>3</Text>
            </View>
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Address</Text>
            <Text style={styles.progressLabelInactive}>Payment</Text>
            <Text style={styles.progressLabelInactive}>Summary</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* DELIVERY INSTRUCTIONS */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2DA8FF" />
            <Text style={styles.infoText}>
              Choose where you want your order delivered
            </Text>
          </View>

          {/* SAVED ADDRESSES */}
          {SAVED_ADDRESSES.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={selectedAddress === address.id}
              onSelect={() => {
                lightTap();
                setSelectedAddress(address.id);
              }}
              onEdit={() => handleEditAddress(address.id)}
            />
          ))}

          {/* ADD NEW ADDRESS */}
          <TouchableOpacity
            style={styles.addAddressBtn}
            onPress={handleAddAddress}
          >
            <View style={styles.addIconBox}>
              <Ionicons name="add" size={24} color="#2DA8FF" />
            </View>
            <Text style={styles.addAddressText}>Add New Address</Text>
            <Ionicons name="chevron-forward" size={20} color="#2DA8FF" />
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* CONTINUE BUTTON */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>Continue to Payment</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ===== ADDRESS CARD COMPONENT ===== */
function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
}: {
  address: any;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.addressCard, selected && styles.addressCardActive]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeBox}>
          <View
            style={[
              styles.addressIconBox,
              selected && styles.addressIconBoxActive,
            ]}
          >
            <Ionicons
              name={address.icon}
              size={20}
              color={selected ? "#fff" : "#2DA8FF"}
            />
          </View>
          <View style={styles.addressTypeInfo}>
            <Text style={styles.addressLabel}>{address.label}</Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <Ionicons name="create-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.addressBody}>
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.addressText}>{address.address}</Text>
        </View>
        {address.landmark && (
          <View style={styles.addressRow}>
            <Ionicons name="navigate-outline" size={16} color="#666" />
            <Text style={styles.addressLandmark}>{address.landmark}</Text>
          </View>
        )}
        <View style={styles.addressRow}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.addressPhone}>{address.phone}</Text>
        </View>
      </View>

      {/* SELECTION INDICATOR */}
      <View style={styles.radioContainer}>
        <View style={[styles.radio, selected && styles.radioActive]}>
          {selected && <View style={styles.radioDot} />}
        </View>
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
    backgroundColor: "#2DA8FF",
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
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1976d2",
  },

  // Address Card
  addressCard: {
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

  addressCardActive: {
    borderColor: "#2DA8FF",
    backgroundColor: "#f0f9ff",
  },

  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  addressTypeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  addressIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },

  addressIconBoxActive: {
    backgroundColor: "#2DA8FF",
  },

  addressTypeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  addressLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  defaultBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  defaultBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },

  editBtn: {
    padding: 5,
  },

  addressBody: {
    gap: 8,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },

  addressLandmark: {
    flex: 1,
    fontSize: 13,
    color: "#666",
  },

  addressPhone: {
    flex: 1,
    fontSize: 13,
    color: "#2DA8FF",
    fontWeight: "600",
  },

  radioContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },

  radio: {
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

  // Add Address Button
  addAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2DA8FF",
    borderStyle: "dashed",
    gap: 12,
  },

  addIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },

  addAddressText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#2DA8FF",
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