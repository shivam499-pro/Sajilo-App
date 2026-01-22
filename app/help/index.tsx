import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { lightTap } from "@/utils/haptics";

const FAQ_DATA = [
  {
    question: "How do I track my order?",
    answer:
      "You can track your order in real-time from the Orders section. You'll receive notifications at each stage of delivery.",
  },
  {
    question: "What if my order is delayed?",
    answer:
      "If your order is taking longer than expected, please contact our support team. We'll help resolve the issue immediately.",
  },
  {
    question: "How do I cancel my order?",
    answer:
      "You can cancel your order within 60 seconds of placing it from the Orders section. After that, please contact support.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Cash on Delivery, Credit/Debit Cards, Mobile Wallets, and UPI payments.",
  },
  {
    question: "How do I report an issue with my order?",
    answer:
      "Go to Orders > Select your order > Report Issue. Our team will assist you within 24 hours.",
  },
  {
    question: "How does the refund process work?",
    answer:
      "Refunds are processed within 5-7 business days to your original payment method after issue verification.",
  },
];

export default function HelpScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    lightTap();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactOption = (type: string) => {
    lightTap();
    switch (type) {
      case "chat":
        Alert.alert("Chat Support", "Connecting you to our support team...");
        break;
      case "call":
        Linking.openURL("tel:+9779812345678");
        break;
      case "email":
        Linking.openURL("mailto:support@sajilo.com");
        break;
      case "whatsapp":
        Linking.openURL("whatsapp://send?phone=9779812345678");
        break;
    }
  };

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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* QUICK ACTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <View style={styles.contactGrid}>
              <ContactCard
                icon="chatbubble-ellipses-outline"
                title="Live Chat"
                subtitle="24/7 Support"
                color="#10b981"
                onPress={() => handleContactOption("chat")}
              />
              <ContactCard
                icon="call-outline"
                title="Call Us"
                subtitle="Mon-Sun"
                color="#2DA8FF"
                onPress={() => handleContactOption("call")}
              />
              <ContactCard
                icon="mail-outline"
                title="Email"
                subtitle="Get help"
                color="#f59e0b"
                onPress={() => handleContactOption("email")}
              />
              <ContactCard
                icon="logo-whatsapp"
                title="WhatsApp"
                subtitle="Quick reply"
                color="#25D366"
                onPress={() => handleContactOption("whatsapp")}
              />
            </View>
          </View>

          {/* COMMON ISSUES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Issues</Text>
            <View style={styles.issuesCard}>
              <IssueItem
                icon="time-outline"
                title="Order Delayed"
                onPress={() => {
                  lightTap();
                  Alert.alert(
                    "Order Delayed",
                    "Track your order or contact support for assistance."
                  );
                }}
              />
              <IssueItem
                icon="close-circle-outline"
                title="Wrong Order"
                onPress={() => {
                  lightTap();
                  Alert.alert(
                    "Wrong Order",
                    "Please report this issue and we'll resolve it immediately."
                  );
                }}
              />
              <IssueItem
                icon="card-outline"
                title="Payment Failed"
                onPress={() => {
                  lightTap();
                  Alert.alert(
                    "Payment Failed",
                    "Check your payment method or try again."
                  );
                }}
              />
              <IssueItem
                icon="refresh-outline"
                title="Refund Status"
                onPress={() => {
                  lightTap();
                  Alert.alert(
                    "Refund Status",
                    "Refunds are processed within 5-7 business days."
                  );
                }}
              />
            </View>
          </View>

          {/* FAQ SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqCard}>
              {FAQ_DATA.map((faq, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqHeader}>
                    <View style={styles.faqIcon}>
                      <Ionicons
                        name="help-circle-outline"
                        size={20}
                        color="#2DA8FF"
                      />
                    </View>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Ionicons
                      name={
                        expandedIndex === index
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={20}
                      color="#999"
                    />
                  </View>
                  {expandedIndex === index && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* OTHER RESOURCES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More Resources</Text>
            <View style={styles.resourcesCard}>
              <ResourceItem
                icon="document-text-outline"
                title="User Guide"
                subtitle="Learn how to use the app"
                onPress={() => {
                  lightTap();
                  Alert.alert("User Guide", "Opening user guide...");
                }}
              />
              <ResourceItem
                icon="shield-checkmark-outline"
                title="Safety Guidelines"
                subtitle="Order safely during COVID-19"
                onPress={() => {
                  lightTap();
                  Alert.alert("Safety", "View safety guidelines");
                }}
              />
              <ResourceItem
                icon="megaphone-outline"
                title="Submit Feedback"
                subtitle="Help us improve"
                onPress={() => {
                  lightTap();
                  Alert.alert("Feedback", "Share your feedback with us");
                }}
              />
            </View>
          </View>

          {/* EMERGENCY CONTACT */}
          <View style={styles.emergencyCard}>
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
            <Text style={styles.emergencyTitle}>Emergency Support</Text>
            <Text style={styles.emergencyText}>
              For urgent issues, call us immediately
            </Text>
            <TouchableOpacity
              style={styles.emergencyBtn}
              onPress={() => {
                lightTap();
                Linking.openURL("tel:+9779812345678");
              }}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.emergencyBtnText}>Call Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

/* ===== CONTACT CARD COMPONENT ===== */
function ContactCard({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.contactCard} onPress={onPress}>
      <View style={[styles.contactCardIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.contactCardTitle}>{title}</Text>
      <Text style={styles.contactCardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

/* ===== ISSUE ITEM COMPONENT ===== */
function IssueItem({
  icon,
  title,
  onPress,
}: {
  icon: any;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.issueItem} onPress={onPress}>
      <View style={styles.issueIcon}>
        <Ionicons name={icon} size={22} color="#ef4444" />
      </View>
      <Text style={styles.issueTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

/* ===== RESOURCE ITEM COMPONENT ===== */
function ResourceItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.resourceItem} onPress={onPress}>
      <View style={styles.resourceIcon}>
        <Ionicons name={icon} size={22} color="#2DA8FF" />
      </View>
      <View style={styles.resourceContent}>
        <Text style={styles.resourceTitle}>{title}</Text>
        <Text style={styles.resourceSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
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

  // Contact Grid
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 10,
  },

  contactCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  contactCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  contactCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },

  contactCardSubtitle: {
    fontSize: 11,
    color: "#666",
  },

  // Issues Card
  issuesCard: {
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

  issueItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  issueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  issueTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },

  // FAQ Card
  faqCard: {
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

  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  faqIcon: {
    marginRight: 10,
  },

  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },

  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingLeft: 62,
  },

  faqAnswerText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },

  // Resources Card
  resourcesCard: {
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

  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  resourceContent: {
    flex: 1,
  },

  resourceTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },

  resourceSubtitle: {
    fontSize: 12,
    color: "#666",
  },

  // Emergency Card
  emergencyCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginTop: 10,
  },

  emergencyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginTop: 12,
    marginBottom: 4,
  },

  emergencyText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },

  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },

  emergencyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});