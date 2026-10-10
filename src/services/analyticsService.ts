import { getUtmForAnalytics, parseUtmParameters } from '../utils/urlParams';

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
    // Synchronize UTM parameters from storage and active URL
    const activeUtms = getUtmForAnalytics();

    // Merge UTM parameters smoothly into event params so attribution is never dropped
    const mergedParams: Record<string, any> = {
      ...activeUtms,
      ...(params || {})
    };

    const event: GA4Event = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      timestamp: new Date().toLocaleTimeString(),
      eventName,
      params: mergedParams
    };

    this.history.push(event);
    if (this.history.length > 100) {
      this.history.shift();
    }

    // Forward to official gtag if available in window
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', eventName, mergedParams);
      } catch (err) {
        console.warn('[GA4 Engine] gtag dispatch error:', err);
      }
    }

    // Broadcast to all active bus listeners
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[GA4 Engine] Analytics listener error:', err);
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
          console.error('[GA4 Engine] Analytics history replay error:', err);
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

// Shared singleton event bus instance across the entire application
export const GA4EventBus = 
  (typeof window !== 'undefined' && (window as any).__MELOTWO_GA4_BUS__) || 
  new AnalyticsEventBus();

if (typeof window !== 'undefined') {
  (window as any).__MELOTWO_GA4_BUS__ = GA4EventBus;
}

export function trackGA4Event(eventName: string, params?: Record<string, any>) {
  GA4EventBus.dispatch(eventName, params);
}

export function subscribeToAnalytics(callback: (event: GA4Event) => void, replayHistory: boolean = true) {
  return GA4EventBus.subscribe(callback, replayHistory);
}

// ============================================================================
// DEDICATED HIGH-CONVERTING CUSTOM EVENT HELPERS
// ============================================================================

/**
 * 1. Track 'click_schedule_demo' on demo booking CTA buttons
 */
export function trackScheduleDemoClick(ctaLocation: string, tier?: string, additionalParams: Record<string, any> = {}) {
  trackGA4Event('click_schedule_demo', {
    cta_location: ctaLocation,
    tier: tier || 'general',
    action: 'book_schedule_demo',
    timestamp: new Date().toISOString(),
    ...additionalParams
  });
}

/**
 * 2. Track 'view_zambia_assessment' on landing on /Zambia-assessment (case-insensitive)
 */
export function trackViewZambiaAssessment(source: string = 'direct', additionalParams: Record<string, any> = {}) {
  trackGA4Event('view_zambia_assessment', {
    page_path: '/Zambia-assessment',
    landing_source: source,
    timestamp: new Date().toISOString(),
    ...additionalParams
  });
}

/**
 * 3. Track 'download_pilot_plan' on downloading onboarding PDFs
 */
export function trackDownloadPilotPlan(planName: string = '30-Day Onboarding Pilot Plan', additionalParams: Record<string, any> = {}) {
  trackGA4Event('download_pilot_plan', {
    plan_name: planName,
    document_format: 'pdf',
    timestamp: new Date().toISOString(),
    ...additionalParams
  });
}

// ============================================================================
// GLOBAL DOM EVENT LISTENERS & CLEAN URL INITIALIZER
// ============================================================================

let globalListenersInitialized = false;

/**
 * Initializes global click delegation listeners for demo CTAs,
 * route detection for Zambia assessment, and UTM history preservation.
 */
export function initGlobalAnalyticsListeners() {
  if (typeof window === 'undefined' || globalListenersInitialized) return;
  globalListenersInitialized = true;

  // 1. Initial parse of URL search and hash for UTM parameters
  parseUtmParameters();

  // 2. Global DOM click listener for demo booking CTA buttons
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if clicked element or its parent matches a demo scheduling CTA
    const demoButton = target.closest<HTMLElement>(
      '[data-analytics="schedule_demo"], [data-cta="schedule_demo"], [id*="demo"], [class*="demo-btn"], button, a'
    );

    if (demoButton) {
      // Check explicit data attributes first
      const isExplicitDemoCta = 
        demoButton.getAttribute('data-analytics') === 'schedule_demo' ||
        demoButton.getAttribute('data-cta') === 'schedule_demo' ||
        demoButton.id === 'btn-schedule-demo' ||
        demoButton.id === 'schedule-demo-cta';

      // Check text content
      const text = (demoButton.textContent || '').trim().toLowerCase();
      const isTextMatch = 
        /schedule.*demo|book.*demo|request.*demo|request.*pilot|start.*trial|calculate.*site.*cost|estimate.*assurance.*cost|configure.*sprint.*pass|configure.*group.*contract/i.test(text);

      if (isExplicitDemoCta || isTextMatch) {
        // Prevent duplicate firing within 300ms
        const now = Date.now();
        const lastClick = Number(demoButton.getAttribute('data-last-analytics-click') || 0);
        if (now - lastClick > 300) {
          demoButton.setAttribute('data-last-analytics-click', String(now));
          trackScheduleDemoClick(
            demoButton.id || demoButton.getAttribute('aria-label') || 'global_button_click',
            demoButton.getAttribute('data-tier') || undefined,
            { button_label: text.substring(0, 50) }
          );
        }
      }
    }
  });

  // 3. Initial check for /Zambia-assessment landing
  const checkZambiaLanding = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (
      path.includes('zambia-assessment') || 
      path.includes('/zambia') || 
      hash.includes('zambia-assessment') ||
      hash.includes('zambia-diagnostic')
    ) {
      trackViewZambiaAssessment('url_landing', {
        raw_pathname: window.location.pathname,
        raw_hash: window.location.hash
      });
    }
  };

  // Run on initial page load
  checkZambiaLanding();

  // Also check on popstate and hashchange
  window.addEventListener('popstate', checkZambiaLanding);
  window.addEventListener('hashchange', checkZambiaLanding);
}
