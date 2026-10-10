/**
 * MeloTwo URL & UTM Parameter Management Utility
 * 
 * Ensures robust, clean URL search parameter parsing and preserves UTM parameters
 * (utm_source, utm_medium, utm_campaign, utm_term, utm_content) across client-side
 * page navigation, hash changes, and history state updates without breaking state.
 */

export interface UtmParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ref?: string;
  referral?: string;
}

const UTM_KEYS: (keyof UtmParameters)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'referral'
];

const SESSION_STORAGE_KEY = 'melotwo_utm_session';
const LOCAL_STORAGE_KEY = 'melotwo_utm_persistent';

// In-memory cache for fast lookups
let cachedUtmParams: UtmParameters | null = null;

/**
 * Cleanly extract query parameters from either search query string or hash query string
 */
function extractParamsFromRawString(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!raw) return result;

  try {
    const clean = raw.startsWith('?') || raw.startsWith('#') ? raw.slice(1) : raw;
    const searchParams = new URLSearchParams(clean);
    searchParams.forEach((val, key) => {
      if (val && typeof val === 'string' && val.trim() !== '') {
        result[key.toLowerCase()] = val.trim();
      }
    });
  } catch (err) {
    console.warn('[URL Params] Failed to parse query string:', err);
  }

  return result;
}

/**
 * Parse and synchronize active UTM parameters from the current URL.
 * Inspects both window.location.search and hash queries (e.g., #zambia-assessment?utm_source=linkedin).
 */
export function parseUtmParameters(): UtmParameters {
  if (typeof window === 'undefined') {
    return {};
  }

  const detected: UtmParameters = {};

  try {
    // 1. Check window.location.search (?utm_source=...)
    const searchEntries = extractParamsFromRawString(window.location.search);

    // 2. Check window.location.hash if it contains query parameters (#page?utm_source=...)
    let hashEntries: Record<string, string> = {};
    if (window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      hashEntries = extractParamsFromRawString(hashQuery);
    }

    // Merge entries, search takes precedence over hash
    const combined = { ...hashEntries, ...searchEntries };

    let foundNew = false;
    UTM_KEYS.forEach((key) => {
      const val = combined[key];
      if (val) {
        detected[key] = val;
        foundNew = true;
      }
    });

    // 3. Fallback to existing stored UTM parameters if current URL does not provide them
    if (!foundNew) {
      const stored = getStoredUtmParameters();
      Object.assign(detected, stored);
    } else {
      // Persist newly discovered UTM parameters
      try {
        const serialized = JSON.stringify(detected);
        sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
        localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
        cachedUtmParams = { ...detected };
      } catch (storageErr) {
        console.warn('[URL Params] Storage write restricted:', storageErr);
      }
    }
  } catch (e) {
    console.error('[URL Params] Error parsing UTM parameters:', e);
  }

  cachedUtmParams = detected;
  return detected;
}

/**
 * Retrieve currently active UTM parameters from cache or storage.
 */
export function getStoredUtmParameters(): UtmParameters {
  if (cachedUtmParams && Object.keys(cachedUtmParams).length > 0) {
    return { ...cachedUtmParams };
  }

  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const fromSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (fromSession) {
      const parsed = JSON.parse(fromSession);
      cachedUtmParams = parsed;
      return parsed;
    }

    const fromLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (fromLocal) {
      const parsed = JSON.parse(fromLocal);
      cachedUtmParams = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('[URL Params] Storage read error:', err);
  }

  return {};
}

/**
 * Return only UTM fields suitable for GA4 event parameters
 */
export function getUtmForAnalytics(): Record<string, string> {
  const params = getStoredUtmParameters();
  const result: Record<string, string> = {};

  if (params.utm_source) result.utm_source = params.utm_source;
  if (params.utm_medium) result.utm_medium = params.utm_medium;
  if (params.utm_campaign) result.utm_campaign = params.utm_campaign;
  if (params.utm_term) result.utm_term = params.utm_term;
  if (params.utm_content) result.utm_content = params.utm_content;

  return result;
}

/**
 * Build a target client-side URL preserving active search and UTM parameters.
 * Prevents client-side navigation (e.g., clicking /blog or /Zambia-assessment)
 * from accidentally wiping out campaign attribution or query parameters.
 */
export function buildPreservedUrl(targetPathOrHash: string): string {
  if (typeof window === 'undefined') return targetPathOrHash;

  try {
    // Current query parameters
    const currentSearch = new URLSearchParams(window.location.search);

    // Merge in any stored UTM parameters if missing in current search
    const utms = getStoredUtmParameters();
    UTM_KEYS.forEach((key) => {
      if (utms[key] && !currentSearch.has(key)) {
        currentSearch.set(key, utms[key]!);
      }
    });

    // Handle hash vs path
    const [urlWithoutHash, hashPartRaw] = targetPathOrHash.split('#');
    const hashPart = hashPartRaw ? `#${hashPartRaw}` : '';
    const [pathPart, targetQueryRaw] = urlWithoutHash.split('?');

    if (targetQueryRaw) {
      const targetParams = new URLSearchParams(targetQueryRaw);
      targetParams.forEach((val, k) => {
        currentSearch.set(k, val);
      });
    }

    const searchStr = currentSearch.toString() ? `?${currentSearch.toString()}` : '';

    if (pathPart === '' && hashPart) {
      const currentPath = window.location.pathname;
      return `${currentPath}${searchStr}${hashPart}`;
    }

    const effectivePath = pathPart || window.location.pathname;
    return `${effectivePath}${searchStr}${hashPart}`;
  } catch (err) {
    console.warn('[URL Params] Error constructing preserved URL:', err);
    return targetPathOrHash;
  }
}

/**
 * Smoothly update browser URL without re-rendering or breaking state,
 * retaining existing query and UTM parameters.
 */
export function navigatePreservingParams(targetPathOrHash: string, replace: boolean = false): void {
  if (typeof window === 'undefined') return;

  const preserved = buildPreservedUrl(targetPathOrHash);
  try {
    if (replace) {
      window.history.replaceState(window.history.state, '', preserved);
    } else {
      window.history.pushState(window.history.state, '', preserved);
    }
  } catch (e) {
    // Fallback if cross-origin or security restricted
    if (targetPathOrHash.startsWith('#')) {
      window.location.hash = targetPathOrHash;
    }
  }
}

/**
 * Initialize automatic history listener to ensure that programmatic
 * history.pushState or replaceState never accidentally strips UTM query parameters.
 */
export function initHistoryUtmPreservation(): void {
  if (typeof window === 'undefined') return;

  // Initial parse on load
  parseUtmParameters();

  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  // Safe wrapper to preserve UTM query string if destination URL omits it
  window.history.pushState = function (state: any, title: string, url?: string | URL | null) {
    if (url && typeof url === 'string') {
      const preserved = buildPreservedUrl(url);
      return originalPushState.apply(this, [state, title, preserved]);
    }
    return originalPushState.apply(this, arguments as any);
  };

  window.history.replaceState = function (state: any, title: string, url?: string | URL | null) {
    if (url && typeof url === 'string') {
      const preserved = buildPreservedUrl(url);
      return originalReplaceState.apply(this, [state, title, preserved]);
    }
    return originalReplaceState.apply(this, arguments as any);
  };
}
