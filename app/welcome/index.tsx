import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { lightTap } from "@/utils/haptics";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const mountainAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(mountainAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(mountainAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const mountainTranslate = mountainAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <LinearGradient colors={["#2DA8FF", "#87CEEB", "#EAF6FF"]} style={styles.container}>
      
      {/* Decorative Mountains (Representing Himalayas) */}
      <Animated.View
        style={[
          styles.mountainContainer,
          { transform: [{ translateY: mountainTranslate }] },
        ]}
      >
        <View style={styles.mountain1} />
        <View style={styles.mountain2} />
        <View style={styles.mountain3} />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        
        {/* App Icon with Nepali Touch */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="fast-food" size={80} color="#DC143C" />
          </View>
          <View style={styles.iconBadge}>
            <Text style={styles.iconBadgeText}>🇳🇵</Text>
          </View>
        </Animated.View>

        {/* Title Section */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Sajilo Delivery</Text>
          <Text style={styles.nepaliTitle}>सजिलो डेलिभरी</Text>
          <Text style={styles.subtitle}>
            From the land of Everest 🏔️ and Buddha 🙏
          </Text>
          <Text style={styles.description}>
            Fresh food delivered fast to your doorstep
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.featureItem}>
            <Ionicons name="time-outline" size={20} color="#DC143C" />
            <Text style={styles.featureText}>Fast Delivery</Text>
          </View>
          {/* <View style={styles.featureItem}>
            <Ionicons name="restaurant-outline" size={20} color="#DC143C" />
            <Text style={styles.featureText}>1000+ Restaurants</Text>
          </View> */}
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#DC143C" />
            <Text style={styles.featureText}>Safe & Secure</Text>
          </View>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              lightTap();
              router.push("/language/select-language");
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#DC143C", "#B8001C"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Serving delicious happiness across Nepal
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Wave Decoration */}
      <View style={styles.waveContainer}>
        <View style={styles.wave} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  mountainContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    height: 200,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
  },

  mountain1: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 140,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: -20,
  },

  mountain2: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderBottomWidth: 180,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: -30,
  },

  mountain3: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 70,
    borderRightWidth: 70,
    borderBottomWidth: 120,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: -20,
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    paddingTop: 100,
  },

  iconContainer: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },

  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  iconBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  iconBadgeText: {
    fontSize: 28,
  },

  textContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 1,
  },

  nepaliTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#DC143C",
    marginBottom: 12,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },

  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },

  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
    paddingHorizontal: 10,
  },

  featureItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  featureText: {
    fontSize: 11,
    color: "#333",
    marginTop: 6,
    fontWeight: "600",
    textAlign: "center",
  },

  buttonContainer: {
    alignItems: "center",
  },

  button: {
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginBottom: 16,
  },

  buttonGradient: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  footerText: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    fontWeight: "500",
  },

  waveContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  wave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
});