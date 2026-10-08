/**
 * Indian currency formatting helper for HOMES2OWN real estate
 * Examples:
 *  - ₹1,85,00,000 -> ₹18.5 Cr
 *  - ₹89,00,000 -> ₹89 Lakh
 *  - ₹95,000 (rent) -> ₹95,000/mo
 */
export const formatIndianPrice = (price, transactionType = 'Buy') => {
  if (price === undefined || price === null || isNaN(price)) return 'Price on Request';
  const num = Number(price);

  if (transactionType === 'Rent') {
    if (num >= 100000) {
      const inLakhs = (num / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${inLakhs} L/mo`;
    }
    return `₹${num.toLocaleString('en-IN')}/mo`;
  }

  // Buy transactions
  if (num >= 10000000) {
    const inCrores = (num / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹${inCrores} Cr`;
  } else if (num >= 100000) {
    const inLakhs = (num / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${inLakhs} Lakh`;
  }

  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Format carpet area
 */
export const formatArea = (sqft) => {
  if (!sqft) return 'N/A';
  return `${Number(sqft).toLocaleString('en-IN')} sq.ft.`;
};

/**
 * Format price per sq ft
 */
export const formatPricePerSqft = (rate) => {
  if (!rate || isNaN(rate)) return 'N/A';
  return `₹${Math.round(rate).toLocaleString('en-IN')} / sq.ft.`;
};

/**
 * Format date for readability
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * WhatsApp consultant link generator with encoded advisory message
 */
export const getWhatsAppLink = (phone, propertyTitle) => {
  const consultantNumber = phone || '+919820155443';
  const cleaned = consultantNumber.replace(/[^\d]/g, '');
  const message = encodeURIComponent(
    `Hello HOMES2OWN, I am interested in exploring ${propertyTitle || 'properties in Mumbai'}. Please share details and availability.`
  );
  return `https://wa.me/${cleaned}?text=${message}`;
};
