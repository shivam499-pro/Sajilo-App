import ProductListSkeleton from "@/components/skeletons/ProductListSkeleton";
import { useCart } from "@/context/CartContext";
import { lightTap, mediumTap, successTap } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useAuth } from '@/context/AuthContext';
import { hasPermission, isActiveUser, PERMISSIONS } from '@/utils/permissions';

// 🆕 Analytics/Tracking
import { analytics } from '@/utils/analytics';

/* ===== IMAGE IMPORTS ===== */
import Logo from "../../../assets/images/Logo.jpeg";
import FastFood from "../../../assets/images/fast-food.png";
import { default as Food1, default as Food2, default as Food3, default as Food4 } from "../../../assets/images/food-1.jpg";
import Fruits from "../../../assets/images/fruits.png";
import SoftDrink from "../../../assets/images/soft-drinks.png";
import Vegetables from "../../../assets/images/vegetable.png";

const { width } = Dimensions.get("window");

// Sample Categories
const CATEGORIES = [
  { id: "1", icon: Fruits, label: "Fruits", route: "/category" },
  { id: "2", icon: Vegetables, label: "Vegetables", route: "/category" },
  { id: "3", icon: FastFood, label: "Fast Food", route: "/category" },
  { id: "4", icon: SoftDrink, label: "Beverages", route: "/category" },
];

// Sample Products
const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Fresh Apples",
    price: 120,
    image: Food1,
    rating: 4.5,
    isVeg: true,
    discount: 10,
    badge: "bestseller", // 🆕
  },
  {
    id: "2",
    name: "Organic Banana",
    price: 80,
    image: Food2,
    rating: 4.3,
    isVeg: true,
    badge: "new", // 🆕
  },
  {
    id: "3",
    name: "Sweet Oranges",
    price: 100,
    image: Food3,
    rating: 4.7,
    isVeg: true,
  },
  {
    id: "4",
    name: "Premium Mango",
    price: 150,
    image: Food4,
    rating: 4.8,
    isVeg: true,
    discount: 15,
    badge: "trending", // 🆕
  },
];

// Sample Offers
const OFFERS = [
  {
    id: "1",
    title: "50% OFF",
    subtitle: "On your first order",
    color: ["#ff6b6b", "#ff8787"],
    code: "FIRST50", // 🆕
  },
  {
    id: "2",
    title: "Free Delivery",
    subtitle: "On orders above ₹199",
    color: ["#51cf66", "#69db7c"],
    code: "FREEDEL", // 🆕
  },
  {
    id: "3",
    title: "30% OFF",
    subtitle: "On fruits & vegetables",
    color: ["#4c6ef5", "#748ffc"],
    code: "FRESH30", // 🆕
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { cartItems, addToCart, increaseQty, decreaseQty } = useCart();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [refreshing, setRefreshing] = useState(false); // 🆕
  const [addingToCart, setAddingToCart] = useState<string | null>(null); // 🆕 Loading state for individual items
  const scrollViewRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);

  // 🆕 Animation for banners
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🆕 Track screen view
  useEffect(() => {
    analytics?.logScreenView('home_screen');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 2000);
    return () => clearTimeout(timer);
  }, [fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      // 🆕 Update active tab when screen is focused
      setActiveTab("home");

      // 🆕 Clear search on navigation back
      setSearchQuery("");
      if (searchInputRef.current) {
        searchInputRef.current?.setNativeProps({ text: '' });
      }

      const onBackPress = () => {
        Alert.alert("Exit App", "Do you want to exit Sajilo?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  // 🆕 Pull to refresh
  const onRefresh = useCallback(() => {
    mediumTap();
    setRefreshing(true);
    analytics?.logEvent('home_pull_refresh');

    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Get cart quantity for a product
  const getCartQuantity = useCallback((productId: string) => {
    const item = cartItems.find((item) => item.id === productId);
    return item?.quantity || 0;
  }, [cartItems]);

  // Total cart items
  const totalCartItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // 🆕 Debounced add to cart
  const handleAddToCart = useCallback((product: any) => {
    // Prevent double clicks
    if (addingToCart === product.id) return;

    if (!hasPermission(userProfile as any, PERMISSIONS.ORDER_CREATE)) {
      Alert.alert(
        'Login Required',
        'Please log in to add items to cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    if (!isActiveUser(userProfile as any)) {
      Alert.alert('Account Inactive', 'Your account is not active. Please contact support.');
      return;
    }

    successTap();
    setAddingToCart(product.id);

    // 🆕 Optimistic update
    addToCart({
      ...product,
      quantity: 1,
      customization: undefined
    });

    // 🆕 Log event
    analytics?.logEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
    });

    // Reset after animation
    setTimeout(() => setAddingToCart(null), 300);
  }, [userProfile, addToCart, router, addingToCart]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.gradient}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={Logo} style={styles.logo} />
            <View>
              <Text style={styles.appName}>Sajilo</Text>
              <TouchableOpacity
                style={styles.locationBox}
                onPress={() => {
                  lightTap();
                  analytics?.logEvent('location_tap');
                  // Navigate to location selector
                }}
              >
                <Ionicons name="location" size={12} color="#2DA8FF" />
                <Text style={styles.locationText}>Kathmandu, Nepal</Text>
                <Ionicons name="chevron-down" size={12} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => {
                lightTap();
                router.push("/profile");
              }}
            >
              <Ionicons name="person-outline" size={24} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => {
                lightTap();
                router.push("/(tabs)/cart");
              }}
            >
              <Ionicons name="cart-outline" size={24} color="#000" />
              {totalCartItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search for products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              onFocus={() => {
                lightTap();
                // 🆕 Navigate to dedicated search screen with query
                router.push("/(tabs)/category");
              }}
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => {
                lightTap();
                setSearchQuery("");
              }}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 🆕 SPECIAL BANNER */}
          {!loading && (
            <Animated.View style={{ opacity: fadeAnim, marginBottom: 16 }}>
              <TouchableOpacity
                style={styles.specialBanner}
                onPress={() => {
                  mediumTap();
                  analytics?.logEvent('special_banner_tap');
                }}
              >
                <View style={styles.bannerContent}>
                  <Ionicons name="gift" size={24} color="#fff" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bannerTitle}>Welcome back! 👋</Text>
                    <Text style={styles.bannerSubtitle}>Your favorites are waiting</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* OFFERS BANNER */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offerContainer}
            >
              {OFFERS.map((offer) => (
                <TouchableOpacity
                  key={offer.id}
                  onPress={() => {
                    mediumTap();
                    analytics?.logEvent('offer_tap', { offer_id: offer.id });
                    // Show offer details with copy code option
                    Alert.alert(
                      offer.title,
                      `Code: ${offer.code}\n\n${offer.subtitle}`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Copy Code",
                          onPress: () => {
                            // Copy to clipboard
                            Alert.alert("Copied!", `Code ${offer.code} copied to clipboard`);
                          }
                        }
                      ]
                    );
                  }}
                >
                  <LinearGradient
                    colors={offer.color as [string, string, ...string[]]}
                    style={styles.offerCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                    <View style={styles.offerArrow}>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* CATEGORIES */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity
              onPress={() => {
                lightTap();
                analytics?.logEvent('see_all_categories');
                router.push("/(tabs)/category");
              }}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {CATEGORIES.map((cat) => (
              <Category
                key={cat.id}
                icon={cat.icon}
                label={cat.label}
                onPress={() => {
                  lightTap();
                  analytics?.logEvent('category_tap', { category: cat.label });
                  router.push(cat.route as any);
                }}
              />
            ))}
          </ScrollView>

          {/* FEATURED PRODUCTS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity
              onPress={() => {
                lightTap();
                analytics?.logEvent('see_all_featured');
                router.push("/(tabs)/category");
              }}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ProductListSkeleton />
          ) : (
            <View style={styles.productsGrid}>
              {FEATURED_PRODUCTS.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartQuantity={getCartQuantity(product.id)}
                  isAdding={addingToCart === product.id}
                  onAdd={() => handleAddToCart(product)}
                  onIncrease={() => {
                    lightTap();
                    analytics?.logEvent('increase_qty', { product_id: product.id });
                    increaseQty(product.id);
                  }}
                  onDecrease={() => {
                    lightTap();
                    analytics?.logEvent('decrease_qty', { product_id: product.id });
                    decreaseQty(product.id);
                  }}
                  onPress={() => {
                    mediumTap();
                    analytics?.logEvent('product_tap', { product_id: product.id });
                    // Navigate to product detail
                  }}
                />
              ))}
            </View>
          )}

          {/* POPULAR ITEMS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Items</Text>
            <TouchableOpacity
              onPress={() => {
                lightTap();
                analytics?.logEvent('see_all_popular');
                router.push("/(tabs)/category");
              }}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalProducts}
          >
            {FEATURED_PRODUCTS.slice(0, 3).map((product) => (
              <HorizontalProductCard
                key={`popular-${product.id}`}
                product={product}
                cartQuantity={getCartQuantity(product.id)}
                isAdding={addingToCart === product.id}
                onAdd={() => handleAddToCart(product)}
                onIncrease={() => {
                  lightTap();
                  increaseQty(product.id);
                }}
                onDecrease={() => {
                  lightTap();
                  decreaseQty(product.id);
                }}
              />
            ))}
          </ScrollView>

          {/* 🆕 RECENTLY VIEWED SECTION */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
            <TouchableOpacity
              onPress={() => {
                lightTap();
                router.push("../orders");
              }}
            >
              <Text style={styles.seeAll}>View History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentlyViewedBox}>
            <Ionicons name="time" size={40} color="#ccc" />
            <Text style={styles.recentlyViewedText}>No items viewed yet</Text>
            <TouchableOpacity
              style={styles.exploreBtnSmall}
              onPress={() => router.push("/(tabs)/category")}
            >
              <Text style={styles.exploreBtnText}>Explore Now</Text>
            </TouchableOpacity>
          </View>

          {/* 🆕 LOYALTY POINTS BANNER */}
          <TouchableOpacity
            style={styles.loyaltyBanner}
            onPress={() => {
              lightTap();
              analytics?.logEvent('loyalty_banner_tap');
              Alert.alert("Loyalty Points", "You have 0 points. Add to cart to earn more!");
            }}
          >
            <View style={styles.loyaltyContent}>
              <View style={styles.loyaltyIcon}>
                <Ionicons name="star" size={24} color="#fbbf24" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.loyaltyTitle}>Earn Points</Text>
                <Text style={styles.loyaltySubtitle}>0 points • Redeem on next order</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* SPACER */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* BOTTOM NAVIGATION */}
        <View style={styles.bottomNav}>
          <NavButton
            icon="home"
            label="Home"
            active={activeTab === "home"}
            onPress={() => {
              lightTap();
              setActiveTab("home");
              analytics?.logEvent('nav_tap', { destination: 'home' });
            }}
          />
          <NavButton
            icon="receipt"
            label="Orders"
            active={activeTab === "orders"}
            onPress={() => {
              lightTap();
              setActiveTab("orders");
              analytics?.logEvent('nav_tap', { destination: 'orders' });
              router.push("../orders");
            }}
          />
          <NavButton
            icon="heart"
            label="Favorites"
            active={activeTab === "favorites"}
            onPress={() => {
              lightTap();
              setActiveTab("favorites");
              analytics?.logEvent('nav_tap', { destination: 'favorites' });
              // router.push("/(tabs)/favorites");
            }}
          />
          <NavButton
            icon="person"
            label="Profile"
            active={activeTab === "profile"}
            onPress={() => {
              lightTap();
              setActiveTab("profile");
              analytics?.logEvent('nav_tap', { destination: 'profile' });
              router.push("/(tabs)/profile");
            }}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

/* ===== CATEGORY COMPONENT (Memoized) ===== */
const Category = React.memo(function Category({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.category} onPress={onPress}>
      <View style={styles.categoryIconBox}>
        <Image source={icon} style={styles.categoryIcon} />
      </View>
      <Text style={styles.categoryText}>{label}</Text>
    </TouchableOpacity>
  );
});

/* ===== PRODUCT CARD (GRID - Memoized) ===== */
const ProductCard = React.memo(function ProductCard({
  product,
  cartQuantity,
  isAdding,
  onAdd,
  onIncrease,
  onDecrease,
  onPress,
}: any) {
  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isAdding}
    >
      <View style={styles.cardImageContainer}>
        <Image source={product.image} style={styles.cardImage} />
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}% OFF</Text>
          </View>
        )}

        {/* 🆕 Badge */}
        {product.badge && (
          <View style={[styles.badgePill, styles[`badge_${product.badge}`]]}>
            <Text style={styles.badgeText}>
              {product.badge === "new" ? "🆕 New" : product.badge === "bestseller" ? "⭐ Best" : "🔥 Trending"}
            </Text>
          </View>
        )}

        {product.isVeg !== undefined && (
          <View style={styles.vegBadge}>
            <View
              style={[styles.vegDot, !product.isVeg && styles.nonVegDot]}
            />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>
          {product.name}
        </Text>

        {product.rating && (
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardPrice}>₹{discountedPrice}</Text>
            {product.discount && (
              <Text style={styles.originalPrice}>
                ₹{product.price}
              </Text>
            )}
          </View>

          {cartQuantity === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={onAdd}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#2DA8FF" />
              ) : (
                <Text style={styles.addBtnText}>ADD</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{cartQuantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

/* ===== HORIZONTAL PRODUCT CARD (Memoized) ===== */
const HorizontalProductCard = React.memo(function HorizontalProductCard({
  product,
  cartQuantity,
  isAdding,
  onAdd,
  onIncrease,
  onDecrease,
}: any) {
  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <View style={styles.horizontalCard}>
      <Image source={product.image} style={styles.horizontalCardImage} />
      {product.isVeg !== undefined && (
        <View style={styles.horizontalVegBadge}>
          <View style={[styles.vegDot, !product.isVeg && styles.nonVegDot]} />
        </View>
      )}

      <View style={styles.horizontalCardContent}>
        <Text style={styles.horizontalCardName} numberOfLines={1}>
          {product.name}
        </Text>
        {product.rating && (
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={10} color="#fbbf24" />
            <Text style={styles.horizontalRatingText}>{product.rating}</Text>
          </View>
        )}
        <Text style={styles.horizontalCardPrice}>₹{discountedPrice}</Text>

        {cartQuantity === 0 ? (
          <TouchableOpacity
            style={styles.horizontalAddBtn}
            onPress={onAdd}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#2DA8FF" />
            ) : (
              <Text style={styles.addBtnText}>ADD</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.horizontalQtyControl}>
            <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{cartQuantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
});

/* ===== BOTTOM NAV BUTTON ===== */
function NavButton({ icon, label, active, onPress }: any) {
  return (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <Ionicons
        name={active ? icon : `${icon}-outline`}
        size={24}
        color={active ? "#2DA8FF" : "#666"}
      />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logo: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },

  appName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },

  locationText: {
    fontSize: 11,
    color: "#666",
  },

  headerRight: {
    flexDirection: "row",
    gap: 12,
  },

  headerIcon: {
    position: "relative",
    padding: 4,
  },

  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  // Search
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // 🆕 Special Banner
  specialBanner: {
    marginHorizontal: 15,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },

  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  bannerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  // Offers
  offerContainer: {
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 20,
  },

  offerCard: {
    width: width * 0.7,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    position: "relative",
  },

  offerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },

  offerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },

  offerArrow: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },

  seeAll: {
    fontSize: 14,
    color: "#2DA8FF",
    fontWeight: "600",
  },

  // Categories
  categories: {
    paddingHorizontal: 15,
    gap: 16,
    marginBottom: 20,
  },

  category: {
    alignItems: "center",
    gap: 8,
  },

  categoryIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  categoryIcon: {
    width: 40,
    height: 40,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },

  // Products Grid
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    gap: 12,
  },

  card: {
    width: (width - 42) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },

  cardImageContainer: {
    position: "relative",
  },

  cardImage: {
    width: "100%",
    height: 140,
  },

  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ff4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  // 🆕 Badge Pill
  badgePill: {
    position: "absolute",
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badge_new: {
    backgroundColor: "#3b82f6",
  },

  badge_bestseller: {
    backgroundColor: "#fbbf24",
  },

  badge_trending: {
    backgroundColor: "#f97316",
  },

  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
  },

  vegBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 4,
  },

  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#22c55e",
  },

  nonVegDot: {
    backgroundColor: "#ef4444",
  },

  cardContent: {
    padding: 10,
  },

  cardName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 6,
  },

  ratingText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  originalPrice: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
  },

  addBtn: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#2DA8FF",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 6,
    minWidth: 50,
    justifyContent: "center",
    alignItems: "center",
    height: 28,
  },

  addBtnText: {
    color: "#2DA8FF",
    fontSize: 12,
    fontWeight: "700",
  },

  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2DA8FF",
    borderRadius: 6,
    overflow: "hidden",
  },

  qtyBtn: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  qtyBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

  qtyText: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    color: "#fff",
  },

  // Horizontal Products
  horizontalProducts: {
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 20,
  },

  horizontalCard: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  horizontalCardImage: {
    width: "100%",
    height: 100,
  },

  horizontalVegBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 4,
  },

  horizontalCardContent: {
    padding: 8,
  },

  horizontalCardName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },

  horizontalRatingText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
  },

  horizontalCardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginTop: 4,
    marginBottom: 8,
  },

  horizontalAddBtn: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#2DA8FF",
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
    minHeight: 28,
    justifyContent: "center",
  },

  horizontalQtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2DA8FF",
    borderRadius: 6,
    justifyContent: "center",
    paddingVertical: 2,
  },

  // 🆕 Recently Viewed
  recentlyViewedBox: {
    marginHorizontal: 15,
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: "center",
  },

  recentlyViewedText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },

  exploreBtnSmall: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#2DA8FF",
    borderRadius: 8,
  },

  exploreBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // 🆕 Loyalty Banner
  loyaltyBanner: {
    marginHorizontal: 15,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  loyaltyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  loyaltyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF3CD",
    justifyContent: "center",
    alignItems: "center",
  },

  loyaltyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },

  loyaltySubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  navButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    flex: 1,
  },

  navLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },

  navLabelActive: {
    color: "#2DA8FF",
    fontWeight: "600",
  },
});