export interface GA4Event {
  id: string;
  timestamp: string;
  eventName: string;
  params?: Record<string, any>;
}

type Listener = (event: GA4Event) => void;

class AnalyticsEventBus {
  private listeners: Listener[] = [];
  private history: GA4Event[] = [];

  dispatch(eventName: string, params?: Record<string, any>) {
    const event: GA4Event = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      timestamp: new Date().toLocaleTimeString(),
      eventName,
      params: params || {}
    };

    this.history.push(event);
    if (this.history.length > 100) {
      this.history.shift();
    }

    // Forward to gtag if available in window
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', eventName, params);
      } catch (err) {
        console.warn('gtag dispatch error:', err);
      }
    }

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Analytics listener error:', err);
      }
    });
  }

  subscribe(callback: Listener, replayHistory: boolean = true): () => void {
    this.listeners.push(callback);
    if (replayHistory) {
      this.history.forEach((event) => {
        try {
          callback(event);
        } catch (err) {
          console.error('Analytics history replay error:', err);
        }
      });
    }
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  getHistory(): GA4Event[] {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }
}

export const GA4EventBus = new AnalyticsEventBus();

export function trackGA4Event(eventName: string, params?: Record<string, any>) {
  GA4EventBus.dispatch(eventName, params);
}

export function subscribeToAnalytics(callback: (event: GA4Event) => void, replayHistory: boolean = true) {
  return GA4EventBus.subscribe(callback, replayHistory);
}
