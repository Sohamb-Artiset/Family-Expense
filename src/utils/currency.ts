// Currency symbols for common currencies
export const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  CNY: "¥",
  INR: "₹",
  BRL: "R$",
  MXN: "MX$"
};

// Exchange rates relative to USD (simplified for demonstration)
// In a real application, these would be fetched from an API
export const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  JPY: 151.23,
  CAD: 1.38,
  AUD: 1.52,
  CNY: 7.23,
  INR: 83.51,
  BRL: 5.12,
  MXN: 16.74
};

/**
 * Returns the currency symbol for a given currency code
 * @param currencyCode The ISO currency code (e.g., USD, EUR, INR)
 * @returns The currency symbol
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return currencySymbols[currencyCode] || currencyCode;
};

/**
 * Converts an amount from USD to the target currency
 * @param amountInINR The amount in USD
 * @param targetCurrency The target currency code
 * @returns The converted amount
 */
export const convertCurrency = (amountInINR: number, targetCurrency: string): number => {
  const rate = exchangeRates[targetCurrency] || 1;
  return amountInINR * rate;
};

/**
 * Formats a monetary amount with the appropriate currency symbol
 * @param amount The monetary amount
 * @param currencyCode The ISO currency code
 * @returns Formatted amount with currency symbol
 */
export const formatCurrency = (amount: number, currency: string) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
};
