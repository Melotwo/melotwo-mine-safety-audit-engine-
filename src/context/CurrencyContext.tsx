import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { SupportedCurrency, CurrencyContextType } from '../types/currency';
import {
  DEFAULT_ZAR_PER_USD,
  getStoredCurrencyOverride,
  saveCurrencyOverride,
  detectVisitorGeoLocation,
  formatCurrencyAmount,
  convertZarToUsdAmount
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
  const exchangeRate = DEFAULT_ZAR_PER_USD;

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
    const symbol = currency === 'USD' ? '$' : 'R';
    const isSouthAfrica = currency === 'ZAR';

    return {
      currency,
      symbol,
      countryCode,
      isAutoDetected,
      isSouthAfrica,
      exchangeRate,
      setCurrency: handleSetCurrency,
      formatPrice: (amountInZar: number, options?: { showCode?: boolean; roundDecimals?: boolean }) => {
        return formatCurrencyAmount(amountInZar, currency, exchangeRate, options);
      },
      convertZarToActive: (amountInZar: number) => {
        if (currency === 'USD') {
          return convertZarToUsdAmount(amountInZar, exchangeRate);
        }
        return amountInZar;
      }
    };
  }, [currency, countryCode, isAutoDetected, exchangeRate]);

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
      exchangeRate: DEFAULT_ZAR_PER_USD,
      setCurrency: () => {},
      formatPrice: (amount: number) => formatCurrencyAmount(amount, 'ZAR'),
      convertZarToActive: (amount: number) => amount
    };
  }
  return ctx;
}
