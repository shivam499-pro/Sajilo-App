import { User, UserRole } from '@/types/user';

const __DEV__ = process.env.NODE_ENV === 'development';

// ==================== PERMISSION CONSTANTS ====================

/**
 * All possible permissions in the system
 * Format: 'resource.action'
 */
export const PERMISSIONS = {
  // Order permissions
  ORDER_CREATE: 'order.create',
  ORDER_VIEW_OWN: 'order.view.own',
  ORDER_VIEW_ALL: 'order.view.all',
  ORDER_CANCEL_OWN: 'order.cancel.own',
  ORDER_CANCEL_ANY: 'order.cancel.any',
  ORDER_UPDATE_STATUS: 'order.update.status',
  ORDER_REFUND: 'order.refund',

  // Vendor permissions
  VENDOR_CREATE: 'vendor.create',
  VENDOR_VIEW: 'vendor.view',
  VENDOR_EDIT_OWN: 'vendor.edit.own',
  VENDOR_EDIT_ANY: 'vendor.edit.any',
  VENDOR_DELETE: 'vendor.delete',

  // Product permissions
  PRODUCT_CREATE: 'product.create',
  PRODUCT_EDIT_OWN: 'product.edit.own',
  PRODUCT_DELETE_OWN: 'product.delete.own',

  // User permissions
  USER_VIEW_OWN: 'user.view.own',
  USER_VIEW_ALL: 'user.view.all',
  USER_EDIT_OWN: 'user.edit.own',
  USER_SUSPEND: 'user.suspend',
  USER_DELETE: 'user.delete',

  // Payment permissions
  PAYMENT_INITIATE: 'payment.initiate',
  PAYMENT_VIEW_OWN: 'payment.view.own',
  PAYMENT_REFUND: 'payment.refund',

  // Delivery permissions
  DELIVERY_ACCEPT: 'delivery.accept',
  DELIVERY_UPDATE_STATUS: 'delivery.update.status',
  DELIVERY_VIEW_ASSIGNED: 'delivery.view.assigned',

  // Analytics permissions
  ANALYTICS_VIEW_OWN: 'analytics.view.own',
  ANALYTICS_VIEW_ALL: 'analytics.view.all',

  // System permissions
  SYSTEM_CONFIG: 'system.config',
  SYSTEM_MAINTENANCE: 'system.maintenance',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ==================== ROLE PERMISSION MAPPING ====================

/**
 * Define which permissions each role has
 * This is the source of truth for access control
 */

const CUSTOMER_PERMISSIONS: Permission[] = [
  PERMISSIONS.ORDER_CREATE,
  PERMISSIONS.ORDER_VIEW_OWN,
  PERMISSIONS.ORDER_CANCEL_OWN,
  PERMISSIONS.VENDOR_VIEW,
  PERMISSIONS.USER_VIEW_OWN,
  PERMISSIONS.USER_EDIT_OWN,
  PERMISSIONS.PAYMENT_INITIATE,
  PERMISSIONS.PAYMENT_VIEW_OWN,
  PERMISSIONS.ANALYTICS_VIEW_OWN,
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  customer: CUSTOMER_PERMISSIONS,

  vendor: [
    ...CUSTOMER_PERMISSIONS,
    PERMISSIONS.VENDOR_EDIT_OWN,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT_OWN,
    PERMISSIONS.PRODUCT_DELETE_OWN,
    PERMISSIONS.ORDER_UPDATE_STATUS,
  ],

  rider: [
    PERMISSIONS.ORDER_VIEW_OWN,
    PERMISSIONS.VENDOR_VIEW,
    PERMISSIONS.USER_VIEW_OWN,
    PERMISSIONS.USER_EDIT_OWN,
    PERMISSIONS.PAYMENT_VIEW_OWN,
    PERMISSIONS.DELIVERY_ACCEPT,
    PERMISSIONS.DELIVERY_UPDATE_STATUS,
    PERMISSIONS.DELIVERY_VIEW_ASSIGNED,
    PERMISSIONS.ANALYTICS_VIEW_OWN,
  ],

  admin: [...Object.values(PERMISSIONS)],

};


// ==================== PERMISSION CHECKER ====================

/**
 * Check if a user has a specific permission
 * Handles multi-role users correctly
 */
export function hasPermission(
  user: User | null,
  permission: Permission
): boolean {
  if (!user || user.status !== 'active') return false;

  return getUserPermissions(user).includes(permission);
}

export function hasAnyRole(user: User | null, roleList: UserRole[]): boolean {
  if (!user) return false;
  const userRoles = user.roles || [user.primaryRole];
  return roleList.some(role => userRoles.includes(role));
}


/**
 * Check if user has ANY of the given permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has ALL of the given permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: Permission[]
): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};

// ==================== ROLE CHECKERS ====================

/**
 * Quick role check helpers
 */
export const isCustomer = (user: User | null): boolean => {
  if (!user) return false;
  return user.primaryRole === 'customer' || user.roles?.includes('customer') || false;
};

export const isVendor = (user: User | null): boolean => {
  if (!user) return false;
  return user.primaryRole === 'vendor' || user.roles?.includes('vendor') || false;
};

export const isRider = (user: User | null): boolean => {
  if (!user) return false;
  return user.primaryRole === 'rider' || user.roles?.includes('rider') || false;
};

export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.primaryRole === 'admin' || user.roles?.includes('admin') || false;
};

/**
 * Check if user is active (not blocked/suspended)
 */
export const isActiveUser = (user: User | null): boolean => {
  if (!user) return false;
  return user.status === 'active';
};

// ==================== OWNERSHIP CHECKERS ====================

/**
 * Check if user owns a resource
 * Used for "edit own" type permissions
 */
export const ownsResource = (
  user: User | null,
  resourceUserId: string
): boolean => {
  if (!user) return false;
  return user.uid === resourceUserId;
};

/**
 * Check if user can edit a specific order
 */
export const canEditOrder = (
  user: User | null,
  order: { userId: string; vendorId?: string; riderId?: string }
): boolean => {
  if (!user) return false;

  // Customer can edit own order (cancel)
  if (ownsResource(user, order.userId)) {
    return hasPermission(user, PERMISSIONS.ORDER_CANCEL_OWN);
  }

  // Vendor can update order status if it's their order
  if (order.vendorId && isVendor(user)) {
    return hasPermission(user, PERMISSIONS.ORDER_UPDATE_STATUS);
  }

  // Rider can update delivery status
  if (order.riderId && isRider(user)) {
    return hasPermission(user, PERMISSIONS.DELIVERY_UPDATE_STATUS);
  }

  // Admin can edit any order
  if (isAdmin(user)) {
    return true;
  }

  return false;
};

/**
 * Check if user can view an order
 */
export const canViewOrder = (
  user: User | null,
  order: { userId: string; vendorId?: string; riderId?: string }
): boolean => {
  if (!user) return false;

  // Own order
  if (ownsResource(user, order.userId)) {
    return hasPermission(user, PERMISSIONS.ORDER_VIEW_OWN);
  }

  // Vendor's order
  if (order.vendorId && isVendor(user)) {
    return true;
  }

  // Rider's delivery
  if (order.riderId && isRider(user)) {
    return hasPermission(user, PERMISSIONS.DELIVERY_VIEW_ASSIGNED);
  }

  // Admin can view all
  if (hasPermission(user, PERMISSIONS.ORDER_VIEW_ALL)) {
    return true;
  }

  return false;
};

// ==================== ERROR MESSAGES ====================

/**
 * Get user-friendly error message for permission denial
 */
export const getPermissionDeniedMessage = (permission: Permission): string => {
  const messages: Partial<Record<Permission, string>> = {
    [PERMISSIONS.ORDER_CREATE]: "You need to be logged in to place orders",
    [PERMISSIONS.VENDOR_EDIT_OWN]: "Only vendor owners can edit their profile",
    [PERMISSIONS.ORDER_REFUND]: "Only admins can issue refunds",
    [PERMISSIONS.USER_SUSPEND]: "You don't have permission to suspend users",
    [PERMISSIONS.SYSTEM_CONFIG]: "Only system administrators can change settings",
  };

  return messages[permission] || "You don't have permission to perform this action";
};

// ==================== REACT HOOKS ====================

/**
 * Hook to check permissions in React components
 * Usage: const canPlaceOrder = usePermission(PERMISSIONS.ORDER_CREATE);
 */
export const usePermission = (user: User | null, permission: Permission): boolean => {
  return hasPermission(user, permission);
};

/**
 * Hook to get all user permissions
 */
export const getUserPermissions = (user: User | null): Permission[] => {
  if (!user) return [];

  const userRoles = user.roles || [user.primaryRole];
  const allPermissions = new Set<Permission>();

  for (const role of userRoles) {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach(p => allPermissions.add(p));
  }

  return Array.from(allPermissions);
};

// ==================== DEBUG HELPERS ====================

/**
 * Log user's permissions (development only)
 */
export const logUserPermissions = (user: User | null): void => {
  if (!__DEV__) return;

  console.log('👤 User Permissions:', {
    uid: user?.uid,
    primaryRole: user?.primaryRole,
    roles: user?.roles,
    status: user?.status,
    permissions: getUserPermissions(user),
  });
};

/**
 * Check if permission system is working correctly
 */
export const validatePermissionSystem = (): boolean => {
  // Verify all roles have permissions defined
  const allRoles: UserRole[] = ['customer', 'vendor', 'rider', 'admin'];

  for (const role of allRoles) {
    if (!ROLE_PERMISSIONS[role]) {
      console.error(`❌ Missing permissions for role: ${role}`);
      return false;
    }
  }

  console.log('✅ Permission system validated');
  return true;
};

// Run validation in development
if (__DEV__) {
  validatePermissionSystem();
}
