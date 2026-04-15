// services/cart.service.ts
import { Cart, CartItem, VendorCart } from '@/types/cart';

export function createEmptyCart(userId: string): Cart {
  return {
    userId,
    vendors: [],
    totalItems: 0,
    totalAmount: 0,
    updatedAt: Date.now(),
  };
}

export function addItemToCart(cart: Cart, item: CartItem): Cart {
  const vendors = [...cart.vendors];
  let vendorCart = vendors.find(v => v.vendorId === item.vendorId);

  if (!vendorCart) {
    vendorCart = {
      vendorId: item.vendorId,
      vendorName: '',
      items: [],
      subtotal: 0,
    };
    vendors.push(vendorCart);
  }

  const existing = vendorCart.items.find(i => i.productId === item.productId);

  if (existing) {
    existing.quantity += item.quantity;
    existing.totalPrice = existing.quantity * existing.unitPrice;
  } else {
    vendorCart.items.push(item);
  }

  vendorCart.subtotal = vendorCart.items.reduce(
    (sum, i) => sum + i.totalPrice,
    0
  );

  return recalculateCart({ ...cart, vendors });
}

export function removeItemFromCart(
  cart: Cart,
  vendorId: string,
  productId: string
): Cart {
  const vendors = cart.vendors
    .map(v => {
      if (v.vendorId !== vendorId) return v;

      const items = v.items.filter(i => i.productId !== productId);
      return {
        ...v,
        items,
        subtotal: items.reduce((s, i) => s + i.totalPrice, 0),
      };
    })
    .filter(v => v.items.length > 0);

  return recalculateCart({ ...cart, vendors });
}

export function updateItemQuantity(
  cart: Cart,
  vendorId: string,
  productId: string,
  quantity: number
): Cart {
  if (quantity <= 0) {
    return removeItemFromCart(cart, vendorId, productId);
  }

  const vendors = cart.vendors.map(v => {
    if (v.vendorId !== vendorId) return v;

    const items = v.items.map(i =>
      i.productId === productId
        ? {
            ...i,
            quantity,
            totalPrice: quantity * i.unitPrice,
          }
        : i
    );

    return {
      ...v,
      items,
      subtotal: items.reduce((s, i) => s + i.totalPrice, 0),
    };
  });

  return recalculateCart({ ...cart, vendors });
}

export function clearCart(cart: Cart): Cart {
  return {
    ...cart,
    vendors: [],
    totalItems: 0,
    totalAmount: 0,
    updatedAt: Date.now(),
  };
}

function recalculateCart(cart: Cart): Cart {
  const totalItems = cart.vendors.reduce(
    (sum, v) => sum + v.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  const totalAmount = cart.vendors.reduce(
    (sum, v) => sum + v.subtotal,
    0
  );

  return {
    ...cart,
    totalItems,
    totalAmount,
    updatedAt: Date.now(),
  };
}
