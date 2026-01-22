import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItemType } from "../types/cart";
import { Alert } from "react-native";

const CART_STORAGE_KEY = "@sajilo_cart";
const MAX_CART_ITEMS = 50; // Prevent cart overflow

export type CartContextType = {
  // State
  cartItems: CartItemType[];
  totalAmount: number;
  totalItems: number;
  loading: boolean;

  // Actions
  addToCart: (item: CartItemType) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  increaseQty: (id: string) => Promise<void>;
  decreaseQty: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
  
  // Advanced features
  applyDiscount: (discountPercent: number) => number;
  getDeliveryFee: () => number;
  getFinalTotal: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);

  // Delivery fee calculation (can be dynamic based on location/distance)
  const DELIVERY_FEE = 50; // Rs. 50 base delivery fee
  const FREE_DELIVERY_THRESHOLD = 500; // Free delivery above Rs. 500

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      saveCart();
    }
  }, [cartItems]);

  // Load cart from storage
  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save cart to storage
  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  // Add item to cart
  const addToCart = async (item: CartItemType) => {
    try {
      setCartItems((prev) => {
        // Check if cart is full
        if (prev.length >= MAX_CART_ITEMS) {
          Alert.alert(
            "Cart Full",
            `You can only add up to ${MAX_CART_ITEMS} items to your cart`
          );
          return prev;
        }

        const existing = prev.find((p) => p.id === item.id);

        if (existing) {
          // Item exists, increase quantity
          return prev.map((p) =>
            p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
          );
        }

        // New item
        return [...prev, { ...item, quantity: 1 }];
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add item to cart");
    }
  };

  // Remove item from cart
  const removeFromCart = async (id: string) => {
    try {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing from cart:", error);
      Alert.alert("Error", "Failed to remove item from cart");
    }
  };

  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      if (quantity > 99) {
        Alert.alert("Quantity Limit", "Maximum 99 items per product");
        return;
      }

      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Failed to update quantity");
    }
  };

  // Increase quantity
  const increaseQty = async (id: string) => {
    try {
      setCartItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            if (item.quantity >= 99) {
              Alert.alert("Quantity Limit", "Maximum 99 items per product");
              return item;
            }
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error increasing quantity:", error);
    }
  };

  // Decrease quantity
  const decreaseQty = async (id: string) => {
    try {
      setCartItems((prev) => {
        return prev
          .map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0);
      });
    } catch (error) {
      console.error("Error decreasing quantity:", error);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setCartItems([]);
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing cart:", error);
      Alert.alert("Error", "Failed to clear cart");
    }
  };

  // Check if item is in cart
  const isInCart = (id: string): boolean => {
    return cartItems.some((item) => item.id === id);
  };

  // Get item quantity
  const getItemQuantity = (id: string): number => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  // Calculate total amount (subtotal)
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate total items count
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Apply discount
  const applyDiscount = (discountPercent: number): number => {
    return totalAmount * (discountPercent / 100);
  };

  // Get delivery fee
  const getDeliveryFee = (): number => {
    return totalAmount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  };

  // Get final total (with delivery fee)
  const getFinalTotal = (): number => {
    return totalAmount + getDeliveryFee();
  };

  return (
    <CartContext.Provider
      value={{
        // State
        cartItems,
        totalAmount,
        totalItems,
        loading,

        // Actions
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQty,
        decreaseQty,
        clearCart,
        isInCart,
        getItemQuantity,

        // Advanced features
        applyDiscount,
        getDeliveryFee,
        getFinalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
































// import React, { createContext, useContext, useState } from "react";
// import { CartItemType } from "../types/cart";

// type CartContextType = {
//   cartItems: CartItemType[];
//   addToCart: (item: CartItemType) => void;
//   removeFromCart: (id: string) => void;
//   updateQuantity: (id: string, quantity:number) => void;
//   increaseQty: (id: string) => void;
//   decreaseQty: (id: string) => void;
//   totalAmount: number;
// };

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const CartProvider = ({ children }: { children: React.ReactNode }) => {
//   const [cartItems, setCartItems] = useState<CartItemType[]>([]);

//   const addToCart = (item: CartItemType) => {
//     setCartItems((prev) => {
//       const existing = prev.find((p) => p.id === item.id);
      
//       if (existing) {
//         return prev.map((p) =>
//           p.id === item.id 
//             ? { ...p, quantity: p.quantity + 1 }
//             : p
//         );
//       }
//       return [...prev, {...item, quantity:1}];
//     });
//   };

//   const removeFromCart = (id: string) => {
//     setCartItems((prev) => prev.filter((item: { id: string; }) => item.id !== id));
//   };
//   const updateQuantity = (id: string, quantity:number) => {
//     if(quantity <= 0){
//         removeFromCart(id);
//         return;
//     }
//     setCartItems((prev) =>
//         prev.map((item) =>
//             item.id === id ? {...item, quantity} : item 
//         )
//     );
//   };

//   const increaseQty = (id: string) => {
//     setCartItems((prev) =>
//       prev.map((item) =>
//         item.id === id
//             ? { ...item, quantity: item.quantity + 1 } : item
//       )
//     );
//   };

//   const decreaseQty = (id: string) => {
//     setCartItems((prev) =>
//       prev.map((item) =>
//           item.id === id ? { ...item, quantity: item.quantity - 1 } : item
//         )
//         .filter((item: { quantity: number; }) => item.quantity > 0)
//     );
//   };

//   const totalAmount = cartItems.reduce(
//     (sum: number,item: { price: number; quantity: number; })  => sum + item.price * item.quantity,
//     0
//   );

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         increaseQty,
//         decreaseQty,
//         totalAmount,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used inside CartProvider");
//   return context;
// };

