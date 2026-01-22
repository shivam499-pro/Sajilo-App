import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { lightTap, mediumTap } from "@/utils/haptics";

// Rupandehi District - Bhairahawa focused locations
// You can easily expand this later for all Nepal
const RUPANDEHI_LOCATIONS = [
  {
    city: "Siddharthanagar (Bhairahawa)",
    areas: [
      "Traffic Chowk",
      "Bank Road",
      "Aawa Road",
      "Milan Chowk",
      "Hospital Road",
      "Golpark",
      "Sunauli Border",
      "Buddha Chowk",
      "Belahiya",
      "Parasi",
    ],
    icon: "🕉️", // Buddha symbol for Bhairahawa
    popular: true,
    description: "Birthplace of Lord Buddha",
  },
  {
    city: "Butwal",
    areas: [
      "Traffic Chowk",
      "Kalika Mandir",
      "Golpark",
      "Milanchowk",
      "Amarpath",
      "Devinagar",
      "Nayabazar",
      "Ramgram Road",
    ],
    icon: "🏙️",
    popular: true,
    description: "Gateway to Western Nepal",
  },
  {
    city: "Tilottama",
    areas: [
      "Manigram",
      "Devdaha",
      "Bodabar",
      "Markhu",
      "Kerwani",
      "Motipur",
    ],
    icon: "🌾",
    popular: false,
    description: "Industrial Hub",
  },
  {
    city: "Devdaha",
    areas: [
      "Devdaha Municipality",
      "Tikuligadh",
      "Rudrapur",
      "Hathihawa",
    ],
    icon: "🛕",
    popular: false,
    description: "Historical Site",
  },
  {
    city: "Lumbini Sanskritik",
    areas: [
      "Lumbini Garden",
      "Maya Devi Temple",
      "Parsa",
      "Kotihawa",
      "Madhuwani",
    ],
    icon: "☸️", // Dharma wheel for Lumbini
    popular: false,
    description: "UNESCO World Heritage Site",
  },
];

export default function SelectLocationScreen() {
  const { completeOnboarding, setHasSelectedLocation } = useAuth();
  const [selectedCity, setSelectedCity] = useState("Siddharthanagar (Bhairahawa)");
  const [selectedArea, setSelectedArea] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAreas, setShowAreas] = useState(true); // Start with areas shown for Bhairahawa
  
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

    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const saved = await AsyncStorage.getItem("selectedLocation");
      if (saved) {
        const location = JSON.parse(saved);
        setSelectedCity(location.city);
        setSelectedArea(location.area);
        setShowAreas(true);
      }
    } catch (error) {
      console.log("Error loading location:", error);
    }
  };

  const handleCitySelect = (city: string) => {
    lightTap();
    setSelectedCity(city);
    setSelectedArea("");
    setShowAreas(true);
    
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAreaSelect = (area: string) => {
    lightTap();
    setSelectedArea(area);
  };

  const handleUseCurrentLocation = () => {
    mediumTap();
    Alert.alert(
      "Enable Location",
      "Allow Sajilo to access your location for accurate delivery?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Allow",
          onPress: () => {
            setSelectedCity("Siddharthanagar (Bhairahawa)");
            setSelectedArea("Current Location");
            setShowAreas(true);
            Alert.alert("Success", "Location detected in Bhairahawa!");
          },
        },
      ]
    );
  };

  const handleConfirm = async () => {
    if (!selectedCity || !selectedArea) {
      Alert.alert("Select Location", "Please select your delivery area");
      return;
    }

    mediumTap();
    const location = { city: selectedCity, area: selectedArea };
    await AsyncStorage.setItem("selectedLocation", JSON.stringify(location));
    setHasSelectedLocation(true);
    await completeOnboarding();
    router.replace("/login");
  };

  const filteredCities = RUPANDEHI_LOCATIONS.filter((loc) =>
    loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.areas.some((area) => area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedCityData = RUPANDEHI_LOCATIONS.find((loc) => loc.city === selectedCity);
  const popularCities = RUPANDEHI_LOCATIONS.filter((loc) => loc.popular);
  const otherCities = RUPANDEHI_LOCATIONS.filter((loc) => !loc.popular);

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            lightTap();
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="location" size={36} color="#DC143C" />
          </View>
          <Text style={styles.title}>Select Delivery Location</Text>
          <Text style={styles.titleNepali}>डेलिभरी स्थान चयन गर्नुहोस्</Text>
          {/* <View style={styles.launchBadge}>
            <Text style={styles.launchBadgeText}>
              🚀 Now Available in Rupandehi!
            </Text>
          </View> */}
          <Text style={styles.subtitle}>
            Serving Bhairahawa & surrounding areas
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Box */}
        <Animated.View
          style={[
            styles.searchContainer,
            { opacity: fadeAnim },
          ]}
        >
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Search for your area in Rupandehi..."
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Current Location */}
        <Animated.View style={[{ opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.currentLocationCard}
            onPress={handleUseCurrentLocation}
            activeOpacity={0.7}
          >
            <View style={styles.currentLocationIcon}>
              <Ionicons name="navigate" size={24} color="#DC143C" />
            </View>
            <View style={styles.currentLocationContent}>
              <Text style={styles.currentLocationTitle}>
                Use Current Location
              </Text>
              <Text style={styles.currentLocationSubtitle}>
                Enable GPS for precise delivery in Bhairahawa
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </Animated.View>

        {/* Info Banner */}
        <Animated.View style={[styles.infoBanner, { opacity: fadeAnim }]}>
          <Ionicons name="information-circle" size={20} color="#2DA8FF" />
          <Text style={styles.infoBannerText}>
            We're starting in Rupandehi district. More cities coming soon!
          </Text>
        </Animated.View>

        {/* City Selection */}
        {!showAreas && (
          <>
            {/* Popular Cities */}
            <Animated.View
              style={[
                styles.section,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="star" size={16} color="#DC143C" />
                <Text style={styles.sectionTitle}>Main Cities</Text>
              </View>

              {popularCities.map((location, index) => (
                <CityCard
                  key={location.city}
                  location={location}
                  isSelected={selectedCity === location.city}
                  onSelect={handleCitySelect}
                  delay={index * 100}
                />
              ))}
            </Animated.View>

            {/* Other Cities */}
            <Animated.View
              style={[
                styles.section,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.sectionTitle}>Nearby Areas</Text>
              </View>

              {otherCities.map((location, index) => (
                <CityCard
                  key={location.city}
                  location={location}
                  isSelected={selectedCity === location.city}
                  onSelect={handleCitySelect}
                  delay={(popularCities.length + index) * 100}
                />
              ))}
            </Animated.View>
          </>
        )}

        {/* Area Selection */}
        {showAreas && selectedCityData && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backToCity}
              onPress={() => {
                lightTap();
                setShowAreas(false);
                setSelectedArea("");
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#DC143C" />
              <Text style={styles.backToCityText}>Change City</Text>
            </TouchableOpacity>

            <View style={styles.cityInfoBanner}>
              <Text style={styles.cityIcon}>{selectedCityData.icon}</Text>
              <View style={styles.cityInfoContent}>
                <Text style={styles.cityInfoTitle}>{selectedCity}</Text>
                <Text style={styles.cityInfoDescription}>
                  {selectedCityData.description}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Ionicons name="navigate-circle" size={18} color="#DC143C" />
              <Text style={styles.sectionTitle}>
                Select Your Delivery Area
              </Text>
            </View>

            {selectedCityData.areas.map((area, index) => (
              <AreaCard
                key={area}
                area={area}
                isSelected={selectedArea === area}
                onSelect={handleAreaSelect}
                delay={index * 80}
              />
            ))}

            {/* Coming Soon Areas */}
            <View style={styles.comingSoonSection}>
              <Text style={styles.comingSoonTitle}>
                🎯 Don't see your area?
              </Text>
              <Text style={styles.comingSoonText}>
                We're rapidly expanding across Rupandehi! Your area might be available soon.
              </Text>
              <TouchableOpacity
                style={styles.requestAreaBtn}
                onPress={() => {
                  lightTap();
                  Alert.alert(
                    "Request New Area",
                    "We'll notify you when we start delivering to your area!",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Request",
                        onPress: () => Alert.alert("Success", "Request submitted!"),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.requestAreaText}>Request My Area</Text>
                <Ionicons name="add-circle-outline" size={18} color="#DC143C" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Confirm Button */}
      {selectedCity && selectedArea && (
        <Animated.View
          style={[
            styles.bottomContainer,
            { opacity: fadeAnim },
          ]}
        >
          <View style={styles.selectedLocationInfo}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <View style={styles.selectedLocationTextContainer}>
              <Text style={styles.selectedLocationText}>{selectedArea}</Text>
              <Text style={styles.selectedLocationCity}>{selectedCity}</Text>
            </View>
          </View>
          
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
              <Text style={styles.confirmText}>Confirm & Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

/* ===== CITY CARD COMPONENT ===== */
function CityCard({
  location,
  isSelected,
  onSelect,
  delay,
}: {
  location: any;
  isSelected: boolean;
  onSelect: (city: string) => void;
  delay: number;
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.cityCard, isSelected && styles.cityCardSelected]}
        onPress={() => onSelect(location.city)}
        activeOpacity={0.7}
      >
        <View style={styles.cityLeft}>
          <View
            style={[
              styles.cityIconContainer,
              isSelected && styles.cityIconContainerSelected,
            ]}
          >
            <Text style={styles.cityIconText}>{location.icon}</Text>
          </View>
          <View style={styles.cityInfo}>
            <Text
              style={[
                styles.cityName,
                isSelected && styles.cityNameSelected,
              ]}
            >
              {location.city}
            </Text>
            <Text style={styles.cityDescription}>{location.description}</Text>
            <Text style={styles.cityAreas}>
              {location.areas.length} delivery areas
            </Text>
          </View>
        </View>
        <Ionicons
          name={isSelected ? "checkmark-circle" : "chevron-forward"}
          size={24}
          color={isSelected ? "#22c55e" : "#999"}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ===== AREA CARD COMPONENT ===== */
function AreaCard({
  area,
  isSelected,
  onSelect,
  delay,
}: {
  area: string;
  isSelected: boolean;
  onSelect: (area: string) => void;
  delay: number;
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.areaCard, isSelected && styles.areaCardSelected]}
        onPress={() => onSelect(area)}
        activeOpacity={0.7}
      >
        <View style={styles.areaLeft}>
          <View
            style={[
              styles.areaIconContainer,
              isSelected && styles.areaIconContainerSelected,
            ]}
          >
            <Ionicons
              name="location"
              size={18}
              color={isSelected ? "#DC143C" : "#666"}
            />
          </View>
          <Text
            style={[
              styles.areaName,
              isSelected && styles.areaNameSelected,
            ]}
          >
            {area}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
        )}
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
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  headerContent: {
    alignItems: "center",
  },

  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 5,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
    textAlign: "center",
  },

  titleNepali: {
    fontSize: 18,
    fontWeight: "700",
    color: "#DC143C",
    marginBottom: 10,
    textAlign: "center",
  },

  launchBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },

  launchBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 150,
  },

  searchContainer: {
    marginBottom: 16,
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#000",
  },

  currentLocationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#22c55e",
  },

  currentLocationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  currentLocationContent: {
    flex: 1,
  },

  currentLocationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },

  currentLocationSubtitle: {
    fontSize: 12,
    color: "#666",
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },

  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#0369A1",
    fontWeight: "500",
  },

  section: {
    marginBottom: 20,
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

  cityIcon: {
    fontSize: 32,
  },

  backToCity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    paddingVertical: 8,
  },

  backToCityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC143C",
  },

  cityInfoBanner: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#DC143C",
  },

  cityInfoContent: {
    marginLeft: 12,
    flex: 1,
  },

  cityInfoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },

  cityInfoDescription: {
    fontSize: 13,
    color: "#666",
  },

  cityCard: {
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

  cityCardSelected: {
    borderColor: "#22c55e",
    backgroundColor: "#fff",
    elevation: 6,
  },

  cityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  cityIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  cityIconContainerSelected: {
    backgroundColor: "#D1FAE5",
  },

  cityIconText: {
    fontSize: 24,
  },

  cityInfo: {
    flex: 1,
  },

  cityName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },

  cityNameSelected: {
    color: "#22c55e",
  },

  cityDescription: {
    fontSize: 12,
    color: "#DC143C",
    marginBottom: 2,
    fontWeight: "500",
  },

  cityAreas: {
    fontSize: 11,
    color: "#999",
  },

  areaCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },

  areaCardSelected: {
    borderColor: "#22c55e",
    backgroundColor: "#fff",
    elevation: 4,
  },

  areaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  areaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },

  areaIconContainerSelected: {
    backgroundColor: "#FEE2E2",
  },

  areaName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  areaNameSelected: {
    color: "#22c55e",
    fontWeight: "700",
  },

  comingSoonSection: {
    marginTop: 20,
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FCD34D",
  },

  comingSoonTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 6,
  },

  comingSoonText: {
    fontSize: 13,
    color: "#78350F",
    marginBottom: 12,
    lineHeight: 18,
  },

  requestAreaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#DC143C",
  },

  requestAreaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC143C",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 16,
    backgroundColor: "rgba(234, 246, 255, 0.98)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  selectedLocationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#D1FAE5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  selectedLocationTextContainer: {
    flex: 1,
  },

  selectedLocationText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#166534",
  },

  selectedLocationCity: {
    fontSize: 12,
    fontWeight: "500",
    color: "#15803D",
    marginTop: 2,
  },

  confirmButton: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
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
    gap: 10,
  },

  confirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});