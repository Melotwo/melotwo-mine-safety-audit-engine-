import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { SupportedCurrency, CurrencyContextType } from '../types/currency';
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_CONFIG_MAP,
  getExchangeRateForCurrency,
  getStoredCurrencyOverride,
  saveCurrencyOverride,
  detectVisitorGeoLocation,
  formatCurrencyAmount,
  formatCurrencyRange,
  convertZarToCurrencyAmount
} from '../services/currencyService';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    return getStoredCurrencyOverride() || 'ZAR';
  });
  const [countryCode, setCountryCode] = useState<string>('ZA');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);

  // Sync state if another part of the app or storage fires an event
  useEffect(() => {
    const handleCurrencyEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ currency: SupportedCurrency }>;
      if (customEvent.detail?.currency && customEvent.detail.currency !== currency) {
        setCurrencyState(customEvent.detail.currency);
      }
    };
    window.addEventListener('melotwo_currency_changed', handleCurrencyEvent);
    return () => window.removeEventListener('melotwo_currency_changed', handleCurrencyEvent);
  }, [currency]);

  // Auto-detect visitor location on initial mount if not overridden
  useEffect(() => {
    const hasManual = getStoredCurrencyOverride();
    if (hasManual) {
      setCurrencyState(hasManual);
      return;
    }

    let isMounted = true;
    detectVisitorGeoLocation().then(geo => {
      if (isMounted) {
        setCountryCode(geo.countryCode);
        setCurrencyState(geo.currency);
        setIsAutoDetected(geo.detectedVia !== 'user_override');
      }
    }).catch(() => {
      // Keep initial ZAR fallback
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetCurrency = (newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    setIsAutoDetected(false);
    saveCurrencyOverride(newCurrency);
  };

  const contextValue = useMemo<CurrencyContextType>(() => {
    const activeConfig = CURRENCY_CONFIG_MAP[currency] || CURRENCY_CONFIG_MAP.ZAR;
    const isSouthAfrica = currency === 'ZAR';
    const exchangeRate = getExchangeRateForCurrency(currency);

    return {
      currency,
      symbol: activeConfig.symbol,
      countryCode,
      isAutoDetected,
      isSouthAfrica,
      exchangeRate,
      allCurrencies: SUPPORTED_CURRENCIES,
      setCurrency: handleSetCurrency,
      formatPrice: (amountInZar: number, options?: { showCode?: boolean; roundDecimals?: boolean; compact?: boolean }) => {
        return formatCurrencyAmount(amountInZar, currency, undefined, options);
      },
      formatRange: (minZar: number, maxZar: number, suffix?: string) => {
        return formatCurrencyRange(minZar, maxZar, currency, suffix);
      },
      convertZarToActive: (amountInZar: number) => {
        return convertZarToCurrencyAmount(amountInZar, currency);
      }
    };
  }, [currency, countryCode, isAutoDetected]);

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    return {
      currency: 'ZAR',
      symbol: 'R',
      countryCode: 'ZA',
      isAutoDetected: false,
      isSouthAfrica: true,
      exchangeRate: 1,
      allCurrencies: SUPPORTED_CURRENCIES,
      setCurrency: () => {},
      formatPrice: (amount: number, options?: any) => formatCurrencyAmount(amount, 'ZAR', undefined, options),
      formatRange: (min: number, max: number, suffix?: string) => formatCurrencyRange(min, max, 'ZAR', suffix),
      convertZarToActive: (amount: number) => amount
    };
  }
  return ctx;
}

