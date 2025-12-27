import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCompactNumber,
  getLocaleFromLanguage,
} from '@/lib/formatters';

export function useLocale() {
  const { i18n } = useTranslation();
  
  const locale = useMemo(() => {
    return getLocaleFromLanguage(i18n.language);
  }, [i18n.language]);

  const currency = useMemo(() => {
    // Default to USD, can be extended to use user preferences
    return 'USD';
  }, []);

  const formatters = useMemo(() => ({
    currency: (amount: number, currencyOverride?: string) => 
      formatCurrency(amount, locale, currencyOverride || currency),
    
    number: (value: number, options?: Intl.NumberFormatOptions) => 
      formatNumber(value, locale, options),
    
    percentage: (value: number, decimals?: number) => 
      formatPercentage(value, locale, decimals),
    
    date: (date: Date | string, options?: Intl.DateTimeFormatOptions) => 
      formatDate(date, locale, options),
    
    dateTime: (date: Date | string) => 
      formatDateTime(date, locale),
    
    relativeTime: (date: Date | string) => 
      formatRelativeTime(date, locale),
    
    compactNumber: (value: number) => 
      formatCompactNumber(value, locale),
  }), [locale, currency]);

  return {
    locale,
    language: i18n.language,
    currency,
    direction: i18n.dir(),
    isRTL: i18n.dir() === 'rtl',
    ...formatters,
  };
}
