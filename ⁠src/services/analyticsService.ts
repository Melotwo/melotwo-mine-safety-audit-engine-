export interface GA4Event {
  id: string;
  timestamp: string;
  eventName: string;
  params: Record<string, any>;
}

type AnalyticsListener = (event: GA4Event) => void;
const listeners = new Set<AnalyticsListener>();

export const subscribeToAnalytics = (listener: AnalyticsListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Triggers a custom Google Analytics 4 tracking event.
 * Securely logs to standard GA4 gtag and our live unmasked debug monitor.
 */
export const trackGA4Event = (eventName: string, params: Record<string, any> = {}) => {
  const event: GA4Event = {
    id: crypto.randomUUID(),
    timestamp: new Date().toLocaleTimeString(),
    eventName,
    params: {
      ...params,
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
    }
  };

  // 1. Log to standard console
  console.log(`%c[GA4 Event Tracker] %c${eventName}`, 'color: #f59e0b; font-weight: bold;', 'color: #3b82f6;', event.params);

  // 2. Dispatch to window.gtag if integrated in production
  if (typeof (window as any).gtag === 'function') {
    try {
      (window as any).gtag('event', eventName, event.params);
    } catch (err) {
      console.warn('Failed to dispatch to native GA4 gtag', err);
    }
  }

  // 3. Notify app listeners (for live dashboard display)
  listeners.forEach(listener => {
    try {
      listener(event);
    } catch (e) {
      console.error(e);
    }
  });
};
