import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { lightTap } from "@/utils/haptics";

export default function AboutScreen() {
  const handleOpenLink = (url: string) => {
    lightTap();
    Linking.openURL(url);
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
          <Text style={styles.headerTitle}>About</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* APP LOGO & INFO */}
          <View style={styles.logoCard}>
            <View style={styles.logoContainer}>
              <Ionicons name="fast-food" size={60} color="#2DA8FF" />
            </View>
            <Text style={styles.appName}>Sajilo Delivery</Text>
            <Text style={styles.appTagline}>
              Your favorite food, delivered fast
            </Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </View>

          {/* ABOUT DESCRIPTION */}
          <View style={styles.section}>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                Sajilo is Nepal's leading food delivery platform, connecting you
                with thousands of restaurants. Order your favorite meals and get
                them delivered to your doorstep quickly and safely.
              </Text>
            </View>
          </View>

          {/* FEATURES SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Choose Sajilo?</Text>
            <View style={styles.featuresCard}>
              <FeatureItem
                icon="flash-outline"
                title="Fast Delivery"
                description="Get your food delivered in 30 minutes or less"
              />
              <FeatureItem
                icon="restaurant-outline"
                title="Wide Selection"
                description="Choose from thousands of restaurants"
              />
              <FeatureItem
                icon="shield-checkmark-outline"
                title="Safe & Secure"
                description="Your data and payments are protected"
              />
              <FeatureItem
                icon="star-outline"
                title="Best Quality"
                description="Partner with top-rated restaurants only"
              />
            </View>
          </View>

          {/* CONTACT SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get in Touch</Text>
            <View style={styles.contactCard}>
              <ContactItem
                icon="mail-outline"
                title="Email Us"
                subtitle="support@sajilo.com"
                onPress={() => handleOpenLink("mailto:support@sajilo.com")}
              />
              <ContactItem
                icon="call-outline"
                title="Call Us"
                subtitle="+977-9812345678"
                onPress={() => handleOpenLink("tel:+9779812345678")}
              />
              <ContactItem
                icon="location-outline"
                title="Visit Us"
                subtitle="Kathmandu, Nepal"
                onPress={() => lightTap()}
              />
            </View>
          </View>

          {/* SOCIAL MEDIA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow Us</Text>
            <View style={styles.socialCard}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => {
                  lightTap();
                  handleOpenLink("https://facebook.com");
                }}
              >
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => {
                  lightTap();
                  handleOpenLink("https://instagram.com");
                }}
              >
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => {
                  lightTap();
                  handleOpenLink("https://twitter.com");
                }}
              >
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => {
                  lightTap();
                  handleOpenLink("https://linkedin.com");
                }}
              >
                <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* LEGAL LINKS */}
          <View style={styles.section}>
            <View style={styles.legalCard}>
              <TouchableOpacity
                style={styles.legalBtn}
                onPress={() => {
                  lightTap();
                  router.push("../terms");
                }}
              >
                <Text style={styles.legalText}>Terms & Conditions</Text>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.legalBtn}
                onPress={() => {
                  lightTap();
                  router.push("../privacy");
                }}
              >
                <Text style={styles.legalText}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Sajilo Technologies Pvt. Ltd.
            </Text>
            <Text style={styles.footerSubtext}>All rights reserved</Text>
            <Text style={styles.footerSubtext}>Made with ❤️ in Nepal</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

/* ===== FEATURE ITEM COMPONENT ===== */
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color="#2DA8FF" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

/* ===== CONTACT ITEM COMPONENT ===== */
function ContactItem({
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
    <TouchableOpacity style={styles.contactItem} onPress={onPress}>
      <View style={styles.contactIcon}>
        <Ionicons name={icon} size={22} color="#2DA8FF" />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
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

  // Logo Card
  logoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },

  appTagline: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },

  versionBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  versionText: {
    fontSize: 12,
    color: "#2DA8FF",
    fontWeight: "600",
  },

  // Section
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

  // Description
  descriptionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
  },

  // Features
  featuresCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },

  featureDescription: {
    fontSize: 12,
    color: "#666",
  },

  // Contact
  contactCard: {
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

  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  contactContent: {
    flex: 1,
  },

  contactTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },

  contactSubtitle: {
    fontSize: 13,
    color: "#2DA8FF",
  },

  // Social Media
  socialCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },

  // Legal
  legalCard: {
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

  legalBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  legalText: {
    fontSize: 14,
    color: "#666",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 30,
  },

  footerText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },

  footerSubtext: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
});