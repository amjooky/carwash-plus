export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} TND`;
};

export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K TND`;
  }
  return `${amount.toFixed(0)} TND`;
};
