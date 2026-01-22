/**
 * API Service Layer for Sajilo Delivery App
 * Centralized service for all Firebase operations
 * This makes your code more maintainable and testable
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/config/firebase";

// ==================== USER SERVICE ====================

export const UserService = {
  /**
   * Get user profile by ID
   */
  async getUser(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },

  /**
   * Create or update user profile
   */
  async createOrUpdateUser(userId: string, userData: any) {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error("Error creating/updating user:", error);
      throw error;
    }
  },

  /**
   * Update user location
   */
  async updateUserLocation(userId: string, location: any) {
    try {
      await updateDoc(doc(db, "users", userId), {
        location,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  },

  /**
   * Add delivery address
   */
  async addAddress(userId: string, address: any) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      const addresses = userData?.addresses || [];
      const newAddress = {
        ...address,
        id: `addr_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      await updateDoc(userRef, {
        addresses: [...addresses, newAddress],
        updatedAt: serverTimestamp(),
      });
      
      return newAddress;
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(userId: string, imageUri: string) {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `users/${userId}/profile.jpg`);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user document with photo URL
      await updateDoc(doc(db, "users", userId), {
        photoURL: downloadURL,
        updatedAt: serverTimestamp(),
      });
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  },
};

// ==================== RESTAURANT SERVICE ====================

export const RestaurantService = {
  /**
   * Get all restaurants for a location
   */
  async getRestaurants(city: string, area?: string) {
    try {
      let q = query(
        collection(db, "restaurants"),
        where("isActive", "==", true),
        where("location.city", "==", city)
      );
      
      if (area) {
        q = query(q, where("location.area", "==", area));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting restaurants:", error);
      throw error;
    }
  },

  /**
   * Get restaurant by ID
   */
  async getRestaurant(restaurantId: string) {
    try {
      const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId));
      if (restaurantDoc.exists()) {
        return { id: restaurantDoc.id, ...restaurantDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting restaurant:", error);
      throw error;
    }
  },

  /**
   * Get menu items for a restaurant
   */
  async getMenuItems(restaurantId: string, category?: string) {
    try {
      let q = query(
        collection(db, "restaurants", restaurantId, "menu"),
        where("isAvailable", "==", true)
      );
      
      if (category) {
        q = query(q, where("category", "==", category));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting menu items:", error);
      throw error;
    }
  },

  /**
   * Search restaurants and menu items
   */
  async searchFood(searchTerm: string, city: string) {
    try {
      // This is a simplified search - in production, use Algolia or similar
      const restaurants = await this.getRestaurants(city);
      
    //   const results = restaurants.filter(restaurant => 
        // restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // restaurant.cuisine.some((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase()))
    //   );
      
    //   return results;
    } catch (error) {
      console.error("Error searching food:", error);
      throw error;
    }
  },
};

// ==================== ORDER SERVICE ====================

export const OrderService = {
  /**
   * Create new order
   */
  async createOrder(userId: string, orderData: any) {
    try {
      const orderId = `ORD_${Date.now()}`;
      
      const order = {
        orderId,
        userId,
        ...orderData,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, "orders", orderId), order);
      
      return orderId;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  /**
   * Get user orders
   */
  async getUserOrders(userId: string) {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting user orders:", error);
      throw error;
    }
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: string) {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (orderDoc.exists()) {
        return { id: orderDoc.id, ...orderDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting order:", error);
      throw error;
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string) {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason: string) {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "cancelled",
        cancellationReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  },

  /**
   * Rate order
   */
  async rateOrder(orderId: string, rating: number, review?: string) {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        rating,
        review,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error rating order:", error);
      throw error;
    }
  },
};

// ==================== NOTIFICATION SERVICE ====================

export const NotificationService = {
  /**
   * Save FCM token for push notifications
   */
  async saveDeviceToken(userId: string, token: string) {
    try {
      await updateDoc(doc(db, "users", userId), {
        deviceToken: token,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving device token:", error);
      throw error;
    }
  },

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string) {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },
};

// ==================== ANALYTICS SERVICE ====================

export const AnalyticsService = {
  /**
   * Log app event (for analytics)
   */
  async logEvent(userId: string, eventName: string, eventData?: any) {
    try {
      await addDoc(collection(db, "analytics"), {
        userId,
        eventName,
        eventData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging event:", error);
      // Don't throw - analytics should not break the app
    }
  },

  /**
   * Track screen view
   */
  async trackScreen(userId: string, screenName: string) {
    await this.logEvent(userId, "screen_view", { screenName });
  },

  /**
   * Track search query
   */
  async trackSearch(userId: string, searchTerm: string, resultsCount: number) {
    await this.logEvent(userId, "search", { searchTerm, resultsCount });
  },
};

// ==================== PROMO/COUPON SERVICE ====================

export const PromoService = {
  /**
   * Get active promo codes
   */
  async getActivePromos() {
    try {
      const q = query(
        collection(db, "promos"),
        where("isActive", "==", true),
        where("expiryDate", ">=", Timestamp.now())
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting promos:", error);
      throw error;
    }
  },

  /**
   * Validate promo code
   */
  async validatePromo(code: string, orderAmount: number) {
    try {
      const q = query(
        collection(db, "promos"),
        where("code", "==", code.toUpperCase()),
        where("isActive", "==", true)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { valid: false, message: "Invalid promo code" };
      }
      
      const promo = snapshot.docs[0].data();
      
      // Check if expired
      if (promo.expiryDate.toDate() < new Date()) {
        return { valid: false, message: "Promo code expired" };
      }
      
      // Check minimum order amount
      if (orderAmount < promo.minOrderAmount) {
        return {
          valid: false,
          message: `Minimum order amount is Rs. ${promo.minOrderAmount}`,
        };
      }
      
      // Calculate discount
      let discount = 0;
      if (promo.discountType === "percentage") {
        discount = (orderAmount * promo.discountValue) / 100;
        if (promo.maxDiscount) {
          discount = Math.min(discount, promo.maxDiscount);
        }
      } else {
        discount = promo.discountValue;
      }
      
      return {
        valid: true,
        discount,
        message: `Discount of Rs. ${discount} applied`,
        promo,
      };
    } catch (error) {
      console.error("Error validating promo:", error);
      throw error;
    }
  },
};

// Export all services
export default {
  UserService,
  RestaurantService,
  OrderService,
  NotificationService,
  AnalyticsService,
  PromoService,
};