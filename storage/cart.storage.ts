// storage/cart.storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart } from '@/types/cart';

const CART_KEY = 'SAJILO_CART_V1';

export const cartStorage = {
  async get(): Promise<Cart | null> {
    try {
      const raw = await AsyncStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('❌ Failed to load cart', e);
      return null;
    }
  },

  async set(cart: Cart): Promise<void> {
    try {
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('❌ Failed to save cart', e);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CART_KEY);
    } catch (e) {
      console.error('❌ Failed to clear cart', e);
    }
  },
};
