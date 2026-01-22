import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { lightTap, mediumTap } from "@/utils/haptics";

// Language options with Nepali cultural representation
const LANGUAGES = [
  {
    code: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
    flag: "🇳🇵",
    popular: true,
    subtitle: "मातृभाषा",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    popular: true,
    subtitle: "Global Language",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    popular: true,
    subtitle: "भारतीय भाषा",
  },
  {
    code: "new",
    name: "Newari",
    nativeName: "नेवारी",
    flag: "🏛️",
    popular: false,
    subtitle: "Kathmandu Valley",
  },
  {
    code: "bho",
    name: "Bhojpuri",
    nativeName: "भोजपुरी",
    flag: "🎭",
    popular: false,
    subtitle: "Terai Region",
  },
  {
    code: "mai",
    name: "Maithili",
    nativeName: "मैथिली",
    flag: "📚",
    popular: false,
    subtitle: "Eastern Nepal",
  },
];

export default function SelectLanguageScreen() {
  const { setHasSelectedLanguage } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState("ne");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem("selectedLanguage");
      if (saved) {
        setSelectedLanguage(saved);
      }
    } catch (error) {
      console.log("Error loading language:", error);
    }
  };

  const handleSelectLanguage = async (code: string) => {
    lightTap();
    setSelectedLanguage(code);
    await AsyncStorage.setItem("selectedLanguage", code);
  };

  const handleConfirm = async () => {
    mediumTap();
    await AsyncStorage.setItem("selectedLanguage", selectedLanguage);
    setHasSelectedLanguage(true);
    router.push("/location/select-location");
  };

  const popularLanguages = LANGUAGES.filter((lang) => lang.popular);
  const otherLanguages = LANGUAGES.filter((lang) => !lang.popular);

  return (
    <LinearGradient colors={["#2DA8FF", "#87CEEB", "#EAF6FF"]} style={styles.container}>
      
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
        <View style={styles.headerIcon}>
          <Ionicons name="language" size={40} color="#DC143C" />
        </View>
        <Text style={styles.title}>Choose Your Language</Text>
        <Text style={styles.titleNepali}>आफ्नो भाषा छान्नुहोस्</Text>
        <Text style={styles.subtitle}>
          Select the language you're most comfortable with
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Popular Languages */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={18} color="#DC143C" />
            <Text style={styles.sectionTitle}>Popular Languages</Text>
          </View>
          
          {popularLanguages.map((lang, index) => (
            <LanguageCard
              key={lang.code}
              language={lang}
              isSelected={selectedLanguage === lang.code}
              onSelect={handleSelectLanguage}
              delay={index * 100}
              fadeAnim={fadeAnim}
            />
          ))}
        </Animated.View>

        {/* Other Languages */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="globe-outline" size={18} color="#666" />
            <Text style={styles.sectionTitle}>Other Languages</Text>
          </View>
          
          {otherLanguages.map((lang, index) => (
            <LanguageCard
              key={lang.code}
              language={lang}
              isSelected={selectedLanguage === lang.code}
              onSelect={handleSelectLanguage}
              delay={(popularLanguages.length + index) * 100}
              fadeAnim={fadeAnim}
            />
          ))}
        </Animated.View>
      </ScrollView>

      {/* Confirm Button */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#DC143C", "#B8001C"]}
            style={styles.confirmGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.confirmText}>Continue</Text>
            <Text style={styles.confirmTextNepali}>जारी राख्नुहोस्</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

/* ===== LANGUAGE CARD COMPONENT ===== */
function LanguageCard({
  language,
  isSelected,
  onSelect,
  delay,
  fadeAnim,
}: {
  language: any;
  isSelected: boolean;
  onSelect: (code: string) => void;
  delay: number;
  fadeAnim: Animated.Value;
}) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    onSelect(language.code);
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.languageCard, isSelected && styles.languageCardSelected]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.languageLeft}>
          <View
            style={[
              styles.flagContainer,
              isSelected && styles.flagContainerSelected,
            ]}
          >
            <Text style={styles.flag}>{language.flag}</Text>
          </View>
          <View style={styles.languageInfo}>
            <Text
              style={[
                styles.languageName,
                isSelected && styles.languageNameSelected,
              ]}
            >
              {language.name}
            </Text>
            <Text style={styles.languageNative}>{language.nativeName}</Text>
            <Text style={styles.languageSubtitle}>{language.subtitle}</Text>
          </View>
        </View>

        <View
          style={[
            styles.radioButton,
            isSelected && styles.radioButtonSelected,
          ]}
        >
          {isSelected && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: "center",
  },

  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000",
    marginBottom: 6,
    textAlign: "center",
  },

  titleNepali: {
    fontSize: 20,
    fontWeight: "700",
    color: "#DC143C",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  languageCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },

  languageCardSelected: {
    borderColor: "#DC143C",
    backgroundColor: "#fff",
    elevation: 6,
    shadowColor: "#DC143C",
    shadowOpacity: 0.3,
  },

  languageLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  flagContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  flagContainerSelected: {
    backgroundColor: "#FEE2E2",
  },

  flag: {
    fontSize: 28,
  },

  languageInfo: {
    flex: 1,
  },

  languageName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },

  languageNameSelected: {
    color: "#DC143C",
  },

  languageNative: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 2,
  },

  languageSubtitle: {
    fontSize: 11,
    color: "#999",
  },

  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  radioButtonSelected: {
    borderColor: "#DC143C",
  },

  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#DC143C",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 15,
    backgroundColor: "rgba(234, 246, 255, 0.95)",
  },

  confirmButton: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 9,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  confirmGradient: {
    flexDirection: "row",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  confirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  confirmTextNepali: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});