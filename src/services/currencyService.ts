import { SupportedCurrency, GeoLocationInfo } from '../types/currency';

export const STORAGE_KEY_CURRENCY_OVERRIDE = 'melotwo_user_currency_override';
export const STORAGE_KEY_GEO_INFO = 'melotwo_user_geo_info';

// Standard baseline exchange rate (18.50 ZAR per 1 USD)
export const DEFAULT_ZAR_PER_USD = 18.5;

/**
 * Convert ZAR amount to USD with proper rounding
 */
export function convertZarToUsdAmount(zarAmount: number, rate: number = DEFAULT_ZAR_PER_USD): number {
  if (!zarAmount || zarAmount <= 0) return 0;
  return Math.round((zarAmount / rate) * 100) / 100;
}

/**
 * Format currency based on active currency type
 */
export function formatCurrencyAmount(
  amountInZar: number,
  currency: SupportedCurrency = 'ZAR',
  rate: number = DEFAULT_ZAR_PER_USD,
  options?: { showCode?: boolean; roundDecimals?: boolean }
): string {
  const { showCode = false, roundDecimals = false } = options || {};

  if (currency === 'USD') {
    const usd = convertZarToUsdAmount(amountInZar, rate);
    const formatted = usd.toLocaleString('en-US', {
      minimumFractionDigits: roundDecimals ? 0 : 2,
      maximumFractionDigits: roundDecimals ? 0 : 2
    });
    return showCode ? `$${formatted} USD` : `$${formatted}`;
  }

  // ZAR
  const formatted = Math.round(amountInZar).toLocaleString('en-ZA');
  return showCode ? `R${formatted} ZAR` : `R${formatted}`;
}

/**
 * Get user manual override if previously saved in localStorage
 */
export function getStoredCurrencyOverride(): SupportedCurrency | null {
  if (typeof localStorage === 'undefined') return null;
  const val = localStorage.getItem(STORAGE_KEY_CURRENCY_OVERRIDE);
  if (val === 'ZAR' || val === 'USD') return val;
  return null;
}

/**
 * Save user manual currency choice
 */
export function saveCurrencyOverride(currency: SupportedCurrency): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CURRENCY_OVERRIDE, currency);
}

/**
 * Detect user country & currency from Express backend or client-side fallback
 */
export async function detectVisitorGeoLocation(): Promise<GeoLocationInfo> {
  // 1. Check if user already manually selected currency
  const manual = getStoredCurrencyOverride();
  if (manual) {
    return {
      countryCode: manual === 'ZAR' ? 'ZA' : 'ZM',
      currency: manual,
      isSouthAfrica: manual === 'ZAR',
      detectedVia: 'user_override'
    };
  }

  // 2. Try server-side detection route
  try {
    const res = await fetch('/api/geo/detect', { credentials: 'same-origin' });
    if (res.ok) {
      const data: GeoLocationInfo = await res.json();
      if (data && data.countryCode) {
        return data;
      }
    }
  } catch (err) {
    // Fail silently to client-side fallback
  }

  // 3. Fallback client-side geolocation check (free lightweight API)
  try {
    const res = await fetch('https://api.country.is/', { mode: 'cors' });
    if (res.ok) {
      const data = await res.json();
      const country = (data?.country || '').toUpperCase();
      const isZA = country === 'ZA';
      return {
        countryCode: country || 'ZA',
        currency: isZA ? 'ZAR' : 'USD',
        isSouthAfrica: isZA,
        detectedVia: 'client_geo_api'
      };
    }
  } catch (e) {
    // Ignore external fetch error
  }

  // 4. Default fallback: South Africa (ZAR)
  return {
    countryCode: 'ZA',
    currency: 'ZAR',
    isSouthAfrica: true,
    detectedVia: 'fallback_default'
  };
}
