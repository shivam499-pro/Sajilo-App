import { useCart } from "@/context/CartContext";
import { lightTap, successTap, mediumTap } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useCallback, useMemo, useRef } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import { useAuth } from '@/context/AuthContext';
import { hasPermission, isActiveUser, PERMISSIONS } from '@/utils/permissions';

// Placeholder images
import Product1 from "../../../assets/images/food-1.jpg";
import React from "react";

// Types
type ProductType = {
  id: string;
  name: string;
  price: number;
  image: any;
  description?: string;
  rating?: number;
  reviewCount?: number;
  isVeg?: boolean;
  category?: string;
  customizable?: boolean;
  inStock?: boolean;
  discount?: number; // 🆕
  badge?: "new" | "bestseller" | "trending"; // 🆕
  prepTime?: number; // 🆕 in minutes
  calories?: number; // 🆕
  sizes?: Array<{ size: string; price: number }>; // 🆕
  addOns?: Array<{ name: string; price: number }>; // 🆕
};

const CATEGORIES = [
  { id: "all", name: "All", icon: "grid-outline" },
  { id: "fruits", name: "Fruits", icon: "nutrition-outline" },
  { id: "vegetables", name: "Vegetables", icon: "leaf-outline" },
  { id: "snacks", name: "Snacks", icon: "fast-food-outline" },
  { id: "beverages", name: "Beverages", icon: "cafe-outline" },
];

// Enhanced sample products
const PRODUCTS: ProductType[] = [
  {
    id: "1",
    name: "Fresh Apple",
    price: 120,
    image: Product1,
    description: "Fresh red apples from Kashmir, sweet and crispy",
    rating: 4.5,
    reviewCount: 250,
    isVeg: true,
    category: "fruits",
    inStock: true,
    discount: 10, // 🆕
    badge: "bestseller", // 🆕
    prepTime: 5, // 🆕
    calories: 52, // 🆕
  },
  {
    id: "2",
    name: "Banana",
    price: 80,
    image: Product1,
    description: "Ripe yellow bananas, rich in potassium",
    rating: 4.3,
    reviewCount: 180,
    isVeg: true,
    category: "fruits",
    inStock: true,
    badge: "new", // 🆕
    prepTime: 3,
    calories: 89,
  },
  {
    id: "3",
    name: "Orange",
    price: 100,
    image: Product1,
    description: "Juicy oranges packed with vitamin C",
    rating: 4.7,
    reviewCount: 320,
    isVeg: true,
    category: "fruits",
    inStock: false, // 🆕 Out of stock
    prepTime: 5,
    calories: 47,
  },
  {
    id: "4",
    name: "Mango",
    price: 150,
    image: Product1,
    description: "Alphonso mangoes, king of fruits",
    rating: 4.8,
    reviewCount: 500,
    isVeg: true,
    category: "fruits",
    customizable: true,
    inStock: true,
    discount: 15,
    badge: "trending", // 🆕
    prepTime: 10,
    calories: 60,
    sizes: [
      { size: "Small (250g)", price: 120 },
      { size: "Medium (500g)", price: 150 },
      { size: "Large (1kg)", price: 280 },
    ],
  },
  {
    id: "5",
    name: "Grapes",
    price: 90,
    image: Product1,
    description: "Seedless green grapes",
    rating: 4.4,
    reviewCount: 150,
    isVeg: true,
    category: "fruits",
    inStock: true,
    prepTime: 5,
    calories: 67,
  },
  {
    id: "6",
    name: "Watermelon",
    price: 40,
    image: Product1,
    description: "Sweet and refreshing watermelon",
    rating: 4.6,
    reviewCount: 280,
    isVeg: true,
    category: "fruits",
    inStock: true,
    badge: "new",
    prepTime: 8,
    calories: 30,
  },
];

export default function CategoryScreen() {
  const { addToCart, increaseQty, decreaseQty } = useCart();
  const { userProfile } = useAuth();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVegOnly, setShowVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price_low" | "price_high" | "rating">("default");
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 🆕
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const [refreshing, setRefreshing] = useState(false); // 🆕 Pull to refresh

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current; // 🆕

  // 🆕 Pull to refresh
  const onRefresh = useCallback(() => {
    mediumTap();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = !showVegOnly || product.isVeg;
      const matchesStock = product.inStock !== false; // 🆕 Filter out of stock
      return matchesCategory && matchesSearch && matchesVeg && matchesStock;
    });
  }, [selectedCategory, searchQuery, showVegOnly]);

  // 🆕 Memoized sorting
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [filteredProducts, sortBy]);

  const getCartQuantity = (productId: string) => cartItems[productId] || 0;

  const totalCartItems = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  // 🆕 Add to cart with permission check
  const handleAddToCart = useCallback((product: ProductType) => {
    if (!hasPermission(userProfile as any, PERMISSIONS.ORDER_CREATE)) {
      Alert.alert(
        'Login Required',
        'Please log in to add items',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    if (!isActiveUser(userProfile as any)) {
      Alert.alert('Account Inactive', 'Your account is not active.');
      return;
    }

    successTap();
    setCartItems(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));

    addToCart({
      ...product,
      quantity: 1,
    } as any);
  }, [userProfile, addToCart, router]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2DA8FF", "#EAF6FF"]} style={styles.gradient}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Menu</Text>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/cart")}
            style={styles.cartBtn}
          >
            <Ionicons name="cart-outline" size={24} color="#000" />
            {totalCartItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for dishes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* CATEGORY TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryTab,
                selectedCategory === cat.id && styles.categoryTabActive,
              ]}
              onPress={() => {
                lightTap();
                setSelectedCategory(cat.id);
              }}
            >
              <Ionicons
                name={cat.icon as any}
                size={20}
                color={selectedCategory === cat.id ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === cat.id && styles.categoryTabTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          <TouchableOpacity
            style={[styles.filterChip, showVegOnly && styles.filterChipActive]}
            onPress={() => {
              lightTap();
              setShowVegOnly(!showVegOnly);
            }}
          >
            <View
              style={[
                styles.vegIcon,
                showVegOnly && styles.vegIconActive,
              ]}
            />
            <Text
              style={[
                styles.filterText,
                showVegOnly && styles.filterTextActive,
              ]}
            >
              Veg Only
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              sortBy === "rating" && styles.filterChipActive,
            ]}
            onPress={() => {
              lightTap();
              setSortBy(sortBy === "rating" ? "default" : "rating");
            }}
          >
            <Ionicons
              name="star"
              size={14}
              color={sortBy === "rating" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.filterText,
                sortBy === "rating" && styles.filterTextActive,
              ]}
            >
              Rating
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              sortBy === "price_low" && styles.filterChipActive,
            ]}
            onPress={() => {
              lightTap();
              setSortBy(sortBy === "price_low" ? "default" : "price_low");
            }}
          >
            <Text
              style={[
                styles.filterText,
                sortBy === "price_low" && styles.filterTextActive,
              ]}
            >
              Low Price
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              sortBy === "price_high" && styles.filterChipActive,
            ]}
            onPress={() => {
              lightTap();
              setSortBy(sortBy === "price_high" ? "default" : "price_high");
            }}
          >
            <Text
              style={[
                styles.filterText,
                sortBy === "price_high" && styles.filterTextActive,
              ]}
            >
              High Price
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* PRODUCT LIST */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* 🆕 Loading state */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2DA8FF" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          )}

          {sortedProducts.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters
              </Text>
            </View>
          ) : (
            sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={getCartQuantity(product.id)}
                onAdd={() => handleAddToCart(product)}
                onIncrease={() => {
                  lightTap();
                  setCartItems(prev => ({
                    ...prev,
                    [product.id]: (prev[product.id] || 0) + 1
                  }));
                  increaseQty(product.id);
                }}
                onDecrease={() => {
                  lightTap();
                  setCartItems(prev => ({
                    ...prev,
                    [product.id]: Math.max(0, (prev[product.id] || 0) - 1)
                  }));
                  decreaseQty(product.id);
                }}
                onPress={() => setSelectedProduct(product)}
              />
            ))
          )}
        </ScrollView>

        {/* PRODUCT DETAIL MODAL */}
        <ProductDetailModal
          product={selectedProduct}
          visible={selectedProduct !== null}
          onClose={() => setSelectedProduct(null)}
          cartQuantity={selectedProduct ? getCartQuantity(selectedProduct.id) : 0}
          onAdd={() => {
            if (selectedProduct) {
              handleAddToCart(selectedProduct);
            }
          }}
          onIncrease={() => {
            if (selectedProduct) {
              lightTap();
              setCartItems(prev => ({
                ...prev,
                [selectedProduct.id]: (prev[selectedProduct.id] || 0) + 1
              }));
              increaseQty(selectedProduct.id);
            }
          }}
          onDecrease={() => {
            if (selectedProduct) {
              lightTap();
              setCartItems(prev => ({
                ...prev,
                [selectedProduct.id]: Math.max(0, (prev[selectedProduct.id] || 0) - 1)
              }));
              decreaseQty(selectedProduct.id);
            }
          }}
        />
      </LinearGradient>
    </View>
  );
}

/* 🆕 MEMOIZED PRODUCT CARD */
const ProductCard = React.memo(({
  product,
  cartQuantity,
  onAdd,
  onIncrease,
  onDecrease,
  onPress,
}: {
  product: ProductType;
  cartQuantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onPress: () => void;
}) => {
  // 🆕 Calculate discounted price
  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !product.inStock && styles.cardDisabled, // 🆕 Out of stock style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!product.inStock}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={product.image} style={styles.cardImage} />

        {/* 🆕 Discount Badge */}
        {product.discount && product.inStock && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}%</Text>
          </View>
        )}

        {/* 🆕 Promo Badge (New/Bestseller/Trending) */}
        {product.badge && product.inStock && (
          <View style={[styles.promoBadge, styles[`badge_${product.badge}`]]}>
            <Text style={styles.promoBadgeText}>
              {product.badge === "new" ? "🆕 New" : product.badge === "bestseller" ? "⭐ Best" : "🔥 Trending"}
            </Text>
          </View>
        )}

        {/* 🆕 Out of Stock Overlay */}
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        {/* Veg Badge */}
        {product.isVeg !== undefined && (
          <View style={styles.vegBadge}>
            <View style={[styles.vegDot, !product.isVeg && styles.nonVegDot]} />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
            {/* 🆕 Prep time */}
            {product.prepTime && (
              <View style={styles.prepTimeBox}>
                <Ionicons name="time-outline" size={12} color="#666" />
                <Text style={styles.prepTimeText}>{product.prepTime} mins</Text>
              </View>
            )}
          </View>

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={12} color="#fbbf24" />
              <Text style={styles.ratingText}>{product.rating}</Text>
              {product.reviewCount && (
                <Text style={styles.reviewText}>({product.reviewCount})</Text>
              )}
            </View>
          )}
        </View>

        {/* Description */}
        {product.description && (
          <Text style={styles.description} numberOfLines={1}>
            {product.description}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.priceSection}>
            {product.discount ? (
              <>
                <Text style={styles.originalPrice}>₹{product.price}</Text>
                <Text style={styles.price}>₹{discountedPrice}</Text>
              </>
            ) : (
              <Text style={styles.price}>₹{product.price}</Text>
            )}
          </View>

          {/* Add/Quantity Control */}
          {!product.inStock ? (
            <TouchableOpacity style={styles.outOfStockBtn} disabled>
              <Text style={styles.outOfStockBtnText}>Out of Stock</Text>
            </TouchableOpacity>
          ) : cartQuantity === 0 ? (
            <TouchableOpacity style={styles.addButton} onPress={onAdd}>
              <Text style={styles.addText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{cartQuantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 🆕 Customizable indicator */}
        {product.customizable && (
          <Text style={styles.customizableText}>✓ Customizable</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

ProductCard.displayName = 'ProductCard';

/* 🆕 ENHANCED PRODUCT DETAIL MODAL */
function ProductDetailModal({
  product,
  visible,
  onClose,
  cartQuantity,
  onAdd,
  onIncrease,
  onDecrease,
}: {
  product: ProductType | null;
  visible: boolean;
  onClose: () => void;
  cartQuantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  const [selectedSize, setSelectedSize] = useState(0); // 🆕
  const [selectedAddOns, setSelectedAddOns] = useState<Set<number>>(new Set()); // 🆕

  if (!product) return null;

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const sizePrice = product.sizes ? product.sizes[selectedSize].price : product.price;

  // 🆕 Calculate add-ons total
  const addOnsTotal = product.addOns
    ? Array.from(selectedAddOns).reduce((sum, idx) => sum + product.addOns![idx].price, 0)
    : 0;

  const totalPrice = sizePrice + addOnsTotal;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
            {/* Image */}
            <View style={styles.modalImageContainer}>
              <Image source={product.image} style={styles.modalImage} />

              {/* Discount Badge */}
              {product.discount && (
                <View style={styles.modalDiscountBadge}>
                  <Text style={styles.modalDiscountText}>{product.discount}%</Text>
                </View>
              )}
            </View>

            {/* Header Info */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{product.name}</Text>

                {product.isVeg !== undefined && (
                  <View style={styles.modalVegBadge}>
                    <View
                      style={[styles.vegDot, !product.isVeg && styles.nonVegDot]}
                    />
                    <Text style={styles.vegText}>
                      {product.isVeg ? "Pure Veg" : "Non-Veg"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Rating */}
              {product.rating && (
                <View style={styles.modalRatingBox}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.modalRatingText}>{product.rating}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            {product.description && (
              <Text style={styles.modalDescription}>{product.description}</Text>
            )}

            {/* 🆕 Nutrition Info */}
            {product.calories && (
              <View style={styles.nutritionBox}>
                <Ionicons name="nutrition" size={16} color="#2DA8FF" />
                <Text style={styles.nutritionText}>{product.calories} kcal per 100g</Text>
              </View>
            )}

            {/* Price Display */}
            <View style={styles.priceDisplayBox}>
              {product.discount ? (
                <>
                  <Text style={styles.modalOriginalPrice}>₹{product.price}</Text>
                  <Text style={styles.modalPriceHighlight}>₹{discountedPrice}</Text>
                </>
              ) : (
                <Text style={styles.modalPriceHighlight}>₹{totalPrice}</Text>
              )}
            </View>

            {/* 🆕 SIZE SELECTION */}
            {product.sizes && (
              <View style={styles.sizeSection}>
                <Text style={styles.sectionTitle}>Select Size</Text>
                {product.sizes.map((size, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.sizeOption,
                      selectedSize === idx && styles.sizeOptionActive,
                    ]}
                    onPress={() => {
                      lightTap();
                      setSelectedSize(idx);
                    }}
                  >
                    <View style={styles.sizeRadio}>
                      {selectedSize === idx && <View style={styles.sizeRadioInner} />}
                    </View>
                    <Text style={styles.sizeOptionText}>{size.size}</Text>
                    <Text style={styles.sizeOptionPrice}>₹{size.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 🆕 ADD-ONS SELECTION */}
            {product.addOns && (
              <View style={styles.addOnsSection}>
                <Text style={styles.sectionTitle}>Add-ons</Text>
                {product.addOns.map((addOn, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.addOnOption}
                    onPress={() => {
                      lightTap();
                      const newAddOns = new Set(selectedAddOns);
                      if (newAddOns.has(idx)) {
                        newAddOns.delete(idx);
                      } else {
                        newAddOns.add(idx);
                      }
                      setSelectedAddOns(newAddOns);
                    }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedAddOns.has(idx) && styles.checkboxActive,
                      ]}
                    >
                      {selectedAddOns.has(idx) && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addOnName}>{addOn.name}</Text>
                    </View>
                    <Text style={styles.addOnPrice}>+₹{addOn.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* 🆕 Footer with Total */}
          <View style={styles.modalFooter}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total: </Text>
              <Text style={styles.totalAmount}>₹{totalPrice}</Text>
            </View>

            {cartQuantity === 0 ? (
              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={() => {
                  onAdd();
                  onClose();
                }}
              >
                <Text style={styles.modalAddText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.modalQtyControl}>
                <TouchableOpacity style={styles.modalQtyBtn} onPress={onDecrease}>
                  <Text style={styles.modalQtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.modalQtyText}>{cartQuantity}</Text>
                <TouchableOpacity style={styles.modalQtyBtn} onPress={onIncrease}>
                  <Text style={styles.modalQtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* STYLES */
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

  iconBtn: {
    padding: 5,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },

  cartBtn: {
    padding: 5,
    position: "relative",
  },

  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },

  categoryTabs: {
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 12,
  },

  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 1,
  },

  categoryTabActive: {
    backgroundColor: "#2DA8FF",
  },

  categoryTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },

  categoryTabTextActive: {
    color: "#fff",
  },

  filterBar: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 12,
    gap: 8,
  },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginRight: 8,
    elevation: 1,
  },

  filterChipActive: {
    backgroundColor: "#22c55e",
  },

  filterText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  filterTextActive: {
    color: "#fff",
  },

  vegIcon: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: "#22c55e",
  },

  vegIconActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },

  productList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  // 🆕 Loading state
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },

  // Product Card
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  // 🆕 Out of stock styling
  cardDisabled: {
    opacity: 0.6,
  },

  imageContainer: {
    position: "relative",
  },

  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },

  // 🆕 Discount badge
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#ff4444",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  discountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // 🆕 Promo badges
  promoBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
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

  promoBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  // 🆕 Out of stock overlay
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  outOfStockText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  vegBadge: {
    position: "absolute",
    top: 50,
    left: 6,
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

  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },

  // 🆕 Prep time
  prepTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  prepTimeText: {
    fontSize: 11,
    color: "#666",
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22c55e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },

  ratingText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },

  reviewText: {
    fontSize: 9,
    color: "#fff",
    marginLeft: 2,
  },

  description: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  addButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#2DA8FF",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
  },

  addText: {
    color: "#2DA8FF",
    fontSize: 13,
    fontWeight: "700",
  },

  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2DA8FF",
    borderRadius: 8,
    overflow: "hidden",
  },

  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  qtyBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },

  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 12,
    color: "#fff",
  },

  customizableText: {
    fontSize: 10,
    color: "#2DA8FF",
    marginTop: 4,
    fontWeight: "600",
  },

  outOfStockBtn: {
    backgroundColor: "#ccc",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  outOfStockBtnText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    color: "#333",
  },

  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: "90%",
  },

  closeBtn: {
    alignSelf: "flex-end",
    padding: 5,
    marginBottom: 10,
  },

  modalImageContainer: {
    position: "relative",
    marginBottom: 16,
  },

  modalImage: {
    width: "100%",
    height: 280,
    borderRadius: 16,
  },

  modalDiscountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#ff4444",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  modalDiscountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },

  modalVegBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  vegText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },

  modalRatingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  modalRatingText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },

  modalDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },

  // 🆕 Nutrition
  nutritionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },

  nutritionText: {
    fontSize: 13,
    color: "#0369A1",
    fontWeight: "500",
  },

  priceDisplayBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  modalOriginalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },

  modalPriceHighlight: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2DA8FF",
  },

  // 🆕 Size Selection
  sizeSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
  },

  sizeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },

  sizeOptionActive: {
    backgroundColor: "#E0F2FE",
    borderColor: "#2DA8FF",
  },

  sizeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2DA8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  sizeRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2DA8FF",
  },

  sizeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    color: "#000",
  },

  sizeOptionPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2DA8FF",
  },

  // 🆕 Add-ons
  addOnsSection: {
    marginBottom: 20,
  },

  addOnOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 8,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },

  addOnName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },

  addOnPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2DA8FF",
  },

  modalFooter: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },

  totalBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },

  totalLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  totalAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2DA8FF",
  },

  modalAddBtn: {
    backgroundColor: "#2DA8FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },

  modalAddText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  modalQtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2DA8FF",
    borderRadius: 12,
    justifyContent: "center",
    paddingVertical: 6,
  },

  modalQtyBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  modalQtyBtnText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  modalQtyText: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 24,
    color: "#fff",
  },
});