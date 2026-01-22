// utils/analytics.ts - Analytics tracking utility for Sajilo Delivery App
// Phase 4: Basic analytics implementation
// Can be extended to use Firebase Analytics, Mixpanel, etc.

const __DEV__ = process.env.NODE_ENV === 'development';

/**
 * Event types for analytics tracking
 */
export type AnalyticsEventName =
    // Screen views
    | 'screen_view'
    // User actions
    | 'login_start'
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'signup_complete'
    // Cart actions
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'increase_qty'
    | 'decrease_qty'
    | 'clear_cart'
    // Checkout actions
    | 'checkout_start'
    | 'checkout_address'
    | 'checkout_payment'
    | 'checkout_complete'
    | 'order_placed'
    // Navigation
    | 'category_tap'
    | 'product_tap'
    | 'offer_tap'
    | 'special_banner_tap'
    | 'location_tap'
    // Search
    | 'search'
    | 'search_result_tap'
    // Engagement
    | 'home_pull_refresh'
    | 'see_all_categories'
    | 'see_all_featured'
    | 'see_all_popular'
    // Errors
    | 'error'
    | 'api_error';

/**
 * Event parameters type
 */
export interface AnalyticsEventParams {
    // Common params
    screen_name?: string;
    user_id?: string;
    timestamp?: number;

    // Product params
    product_id?: string;
    product_name?: string;
    price?: number;
    quantity?: number;
    category?: string;

    // Order params
    order_id?: string;
    order_total?: number;
    payment_method?: string;

    // Search params
    search_term?: string;
    results_count?: number;

    // Error params
    error_code?: string;
    error_message?: string;

    // Offer params
    offer_id?: string;
    offer_code?: string;

    // Custom params
    [key: string]: any;
}

/**
 * Analytics class for tracking events
 */
class Analytics {
    private isEnabled: boolean = true;
    private userId: string | null = null;
    private sessionId: string;
    private eventQueue: Array<{ name: string; params: AnalyticsEventParams }> = [];

    constructor() {
        this.sessionId = this.generateSessionId();

        if (__DEV__) {
            console.log('📊 Analytics initialized (Development Mode)');
        }
    }

    /**
     * Generate a unique session ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Set the current user ID for tracking
     */
    setUserId(userId: string | null): void {
        this.userId = userId;
        if (__DEV__) {
            console.log('📊 Analytics user set:', userId);
        }
    }

    /**
     * Enable or disable analytics
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        if (__DEV__) {
            console.log('📊 Analytics enabled:', enabled);
        }
    }

    /**
     * Log a screen view
     */
    logScreenView(screenName: string, params?: AnalyticsEventParams): void {
        this.logEvent('screen_view', {
            screen_name: screenName,
            ...params,
        });
    }

    /**
     * Log a custom event
     */
    logEvent(eventName: AnalyticsEventName | string, params?: AnalyticsEventParams): void {
        if (!this.isEnabled) return;

        const eventData: AnalyticsEventParams = {
            ...params,
            timestamp: Date.now(),
            user_id: this.userId || undefined,
            session_id: this.sessionId,
        };

        // In development, just log to console
        if (__DEV__) {
            console.log(`📊 Event: ${eventName}`, eventData);
        }

        // Add to queue for batch processing (future implementation)
        this.eventQueue.push({ name: eventName, params: eventData });

        // TODO: In production, send to Firebase Analytics or other service
        // Example:
        // if (!__DEV__) {
        //   firebaseAnalytics.logEvent(eventName, eventData);
        // }
    }

    /**
     * Log an error event
     */
    logError(errorCode: string, errorMessage: string, additionalParams?: AnalyticsEventParams): void {
        this.logEvent('error', {
            error_code: errorCode,
            error_message: errorMessage,
            ...additionalParams,
        });
    }

    /**
     * Log API error
     */
    logApiError(endpoint: string, statusCode: number, errorMessage: string): void {
        this.logEvent('api_error', {
            endpoint,
            status_code: statusCode,
            error_message: errorMessage,
        });
    }

    /**
     * Log add to cart event
     */
    logAddToCart(productId: string, productName: string, price: number, quantity: number = 1): void {
        this.logEvent('add_to_cart', {
            product_id: productId,
            product_name: productName,
            price,
            quantity,
        });
    }

    /**
     * Log checkout start
     */
    logCheckoutStart(cartTotal: number, itemCount: number): void {
        this.logEvent('checkout_start', {
            cart_total: cartTotal,
            item_count: itemCount,
        });
    }

    /**
     * Log order placed
     */
    logOrderPlaced(orderId: string, orderTotal: number, paymentMethod: string): void {
        this.logEvent('order_placed', {
            order_id: orderId,
            order_total: orderTotal,
            payment_method: paymentMethod,
        });
    }

    /**
     * Log search event
     */
    logSearch(searchTerm: string, resultsCount: number): void {
        this.logEvent('search', {
            search_term: searchTerm,
            results_count: resultsCount,
        });
    }

    /**
     * Get queued events (for debugging)
     */
    getEventQueue(): Array<{ name: string; params: AnalyticsEventParams }> {
        return [...this.eventQueue];
    }

    /**
     * Clear event queue
     */
    clearEventQueue(): void {
        this.eventQueue = [];
    }

    /**
     * Flush events to server (future implementation)
     */
    async flush(): Promise<void> {
        if (this.eventQueue.length === 0) return;

        if (__DEV__) {
            console.log(`📊 Flushing ${this.eventQueue.length} events`);
        }

        // TODO: Send events to analytics server
        // const events = [...this.eventQueue];
        // this.eventQueue = [];
        // await sendToServer(events);
    }
}

// Export singleton instance
export const analytics = new Analytics();

// Export class for testing
export default Analytics;
