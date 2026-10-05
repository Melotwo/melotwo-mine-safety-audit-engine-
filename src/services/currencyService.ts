import { SupportedCurrency, CurrencyConfig, GeoLocationInfo } from '../types/currency';

export const STORAGE_KEY_CURRENCY_OVERRIDE = 'melotwo_user_currency_override';
export const STORAGE_KEY_GEO_INFO = 'melotwo_user_geo_info';

// Standard baseline exchange rates (ZAR per 1 unit of foreign currency)
export const DEFAULT_ZAR_PER_USD = 18.5;
export const DEFAULT_ZAR_PER_EUR = 20.2;
export const DEFAULT_ZAR_PER_GBP = 23.8;

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', zarPerUnit: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', zarPerUnit: DEFAULT_ZAR_PER_USD },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', zarPerUnit: DEFAULT_ZAR_PER_EUR },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', zarPerUnit: DEFAULT_ZAR_PER_GBP },
];

export const CURRENCY_CONFIG_MAP: Record<SupportedCurrency, CurrencyConfig> = {
  ZAR: SUPPORTED_CURRENCIES[0],
  USD: SUPPORTED_CURRENCIES[1],
  EUR: SUPPORTED_CURRENCIES[2],
  GBP: SUPPORTED_CURRENCIES[3],
};

/**
 * Get exchange rate (ZAR per 1 unit of active currency)
 */
export function getExchangeRateForCurrency(currency: SupportedCurrency): number {
  return CURRENCY_CONFIG_MAP[currency]?.zarPerUnit || 1;
}

/**
 * Convert ZAR amount to target currency amount with 2 decimal precision
 */
export function convertZarToCurrencyAmount(zarAmount: number, currency: SupportedCurrency): number {
  if (!zarAmount || zarAmount <= 0) return 0;
  if (currency === 'ZAR') return zarAmount;
  const rate = getExchangeRateForCurrency(currency);
  return Math.round((zarAmount / rate) * 100) / 100;
}

/**
 * Legacy wrapper for USD conversion
 */
export function convertZarToUsdAmount(zarAmount: number, rate: number = DEFAULT_ZAR_PER_USD): number {
  if (!zarAmount || zarAmount <= 0) return 0;
  return Math.round((zarAmount / rate) * 100) / 100;
}

/**
 * Format currency based on active currency type with appropriate symbols and separators
 */
export function formatCurrencyAmount(
  amountInZar: number,
  currency: SupportedCurrency = 'ZAR',
  _rate?: number,
  options?: { showCode?: boolean; roundDecimals?: boolean; compact?: boolean }
): string {
  const { showCode = false, roundDecimals = false, compact = false } = options || {};
  const config = CURRENCY_CONFIG_MAP[currency] || CURRENCY_CONFIG_MAP.ZAR;
  const converted = convertZarToCurrencyAmount(amountInZar, currency);

  if (compact && converted >= 1000) {
    if (converted >= 1000000) {
      const millions = (converted / 1000000).toFixed(1).replace(/\.0$/, '');
      return showCode ? `${config.symbol}${millions}m ${config.code}` : `${config.symbol}${millions}m`;
    }
    const thousands = (converted / 1000).toFixed(1).replace(/\.0$/, '');
    return showCode ? `${config.symbol}${thousands}k ${config.code}` : `${config.symbol}${thousands}k`;
  }

  const locale = currency === 'ZAR' ? 'en-ZA' : currency === 'GBP' ? 'en-GB' : currency === 'EUR' ? 'de-DE' : 'en-US';
  const decimals = currency === 'ZAR' ? 0 : roundDecimals ? 0 : 2;

  const formatted = converted.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return showCode ? `${config.symbol}${formatted} ${config.code}` : `${config.symbol}${formatted}`;
}

/**
 * Format price range with proper currency symbols and abbreviations (e.g. "R50k – R150k" or "$2.7k – $8.1k")
 */
export function formatCurrencyRange(
  minZar: number,
  maxZar: number,
  currency: SupportedCurrency = 'ZAR',
  suffix?: string
): string {
  const config = CURRENCY_CONFIG_MAP[currency] || CURRENCY_CONFIG_MAP.ZAR;
  const minConverted = convertZarToCurrencyAmount(minZar, currency);
  const maxConverted = convertZarToCurrencyAmount(maxZar, currency);

  const formatVal = (val: number) => {
    if (val >= 1000000) {
      const m = (val / 1000000).toFixed(1).replace(/\.0$/, '');
      return `${config.symbol}${m}m`;
    }
    if (val >= 1000) {
      const k = (val / 1000).toFixed(1).replace(/\.0$/, '');
      return `${config.symbol}${k}k`;
    }
    return `${config.symbol}${Math.round(val).toLocaleString()}`;
  };

  const rangeStr = `${formatVal(minConverted)} – ${formatVal(maxConverted)}`;
  return suffix ? `${rangeStr} ${suffix}` : rangeStr;
}

/**
 * Get user manual override if previously saved in localStorage
 */
export function getStoredCurrencyOverride(): SupportedCurrency | null {
  if (typeof localStorage === 'undefined') return null;
  const val = localStorage.getItem(STORAGE_KEY_CURRENCY_OVERRIDE);
  if (val === 'ZAR' || val === 'USD' || val === 'EUR' || val === 'GBP') return val;
  return null;
}

/**
 * Save user manual currency choice and dispatch broadcast event
 */
export function saveCurrencyOverride(currency: SupportedCurrency): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CURRENCY_OVERRIDE, currency);

  // Broadcast change across tabs and windows
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('melotwo_currency_changed', { detail: { currency } }));
    } catch {}
  }
}

/**
 * Detect user country & currency from Express backend or client-side fallback
 */
export async function detectVisitorGeoLocation(): Promise<GeoLocationInfo> {
  // 1. Check if user already manually selected currency
  const manual = getStoredCurrencyOverride();
  if (manual) {
    return {
      countryCode: manual === 'ZAR' ? 'ZA' : manual === 'GBP' ? 'GB' : manual === 'EUR' ? 'EU' : 'US',
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
      const isGB = country === 'GB' || country === 'UK';
      const isEU = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI'].includes(country);
      
      const detectedCurrency: SupportedCurrency = isZA ? 'ZAR' : isGB ? 'GBP' : isEU ? 'EUR' : 'USD';
      
      return {
        countryCode: country || 'ZA',
        currency: detectedCurrency,
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

