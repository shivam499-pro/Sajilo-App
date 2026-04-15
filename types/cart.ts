// types/cart.ts
// Phase 5 – Cart & Orders (Industry-grade schema)

export interface CartItem {
  // Identity
  productId: string;
  vendorId: string;

  // Display snapshot
  productName: string;
  imageUrl?: string;

  // Pricing snapshot (VERY IMPORTANT)
  unitPrice: number;
  quantity: number;
  totalPrice: number;

  // Metadata
  addedAt: number; // Date.now()
}

export interface VendorCart {
  vendorId: string;
  vendorName: string;

  items: CartItem[];

  subtotal: number;
}

export interface Cart {
  userId: string;

  vendors: VendorCart[];

  totalItems: number;
  totalAmount: number;

  updatedAt: number;
}
