// Track events
export const analytics = {
  track: async (event: string, properties?: Record<string, unknown>) => {
    try {
      // Send to your analytics service (e.g., PostHog, Mixpanel, or custom)
      // For now, we'll log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event, properties);
      }

      // You can also send to your backend for storage
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties }),
      });
    } catch (error) {
      // Fail silently - don't break the app for analytics
      console.error('Analytics error:', error);
    }
  },

  // Page views
  pageView: (page: string) => {
    analytics.track('page_view', { page });
  },

  // User events
  user: {
    signedUp: (method: string) => {
      analytics.track('user_signed_up', { method });
    },
    loggedIn: (method: string) => {
      analytics.track('user_logged_in', { method });
    },
    upgraded: (tier: string) => {
      analytics.track('user_upgraded', { tier });
    },
  },

  // Caption events
  caption: {
    generated: (platform: string[], tone: string) => {
      analytics.track('caption_generated', { platform, tone });
    },
    copied: (id: string) => {
      analytics.track('caption_copied', { captionId: id });
    },
    saved: (id: string) => {
      analytics.track('caption_saved', { captionId: id });
    },
  },

  // Conversion events
  conversion: {
    checkoutStarted: (tier: string) => {
      analytics.track('checkout_started', { tier });
    },
    checkoutCompleted: (tier: string, amount: number) => {
      analytics.track('checkout_completed', { tier, amount });
    },
    checkoutCanceled: (tier: string) => {
      analytics.track('checkout_canceled', { tier });
    },
  },
};

// Hook for tracking page views
export function usePageTracking() {
  if (typeof window !== 'undefined') {
    const page = window.location.pathname;
    analytics.pageView(page);
  }
}
