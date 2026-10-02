export type SupportedCurrency = 'ZAR' | 'USD';

export interface GeoLocationInfo {
  ip?: string;
  countryCode: string; // e.g. 'ZA', 'ZM', 'US'
  countryName?: string;
  currency: SupportedCurrency;
  isSouthAfrica: boolean;
  detectedVia: 'server_header' | 'client_geo_api' | 'user_override' | 'fallback_default';
}

export interface CurrencyContextType {
  currency: SupportedCurrency;
  symbol: string;
  countryCode: string;
  isAutoDetected: boolean;
  isSouthAfrica: boolean;
  exchangeRate: number; // ZAR per USD (e.g. 18.5)
  setCurrency: (currency: SupportedCurrency) => void;
  formatPrice: (amountInZar: number, options?: { showCode?: boolean; roundDecimals?: boolean }) => string;
  convertZarToActive: (amountInZar: number) => number;
}
