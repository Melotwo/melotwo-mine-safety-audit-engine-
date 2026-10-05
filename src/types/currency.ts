export type SupportedCurrency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  flag: string;
  zarPerUnit: number; // e.g. 1 for ZAR, 18.5 for USD, 20.2 for EUR, 23.8 for GBP
}

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
  exchangeRate: number; // ZAR per current currency unit
  allCurrencies: CurrencyConfig[];
  setCurrency: (currency: SupportedCurrency) => void;
  formatPrice: (amountInZar: number, options?: { showCode?: boolean; roundDecimals?: boolean }) => string;
  formatRange: (minZar: number, maxZar: number, suffix?: string) => string;
  convertZarToActive: (amountInZar: number) => number;
}

