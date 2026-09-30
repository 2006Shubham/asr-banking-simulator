/**
 * Masking utilities to maintain banking privacy and security in UI display.
 */

export const maskAadhaar = (aadhaar) => {
  if (!aadhaar) return "XXXX XXXX XXXX";
  const cleaned = aadhaar.replace(/[^0-9]/g, "");
  if (cleaned.length < 4) return "XXXX XXXX XXXX";
  const last4 = cleaned.slice(-4);
  return `XXXX XXXX ${last4}`;
};

export const maskCardNumber = (cardNo) => {
  if (!cardNo) return "XXXX XXXX XXXX XXXX";
  const cleaned = cardNo.replace(/[^0-9]/g, "");
  if (cleaned.length < 4) return "XXXX XXXX XXXX XXXX";
  const last4 = cleaned.slice(-4);
  return `XXXX XXXX XXXX ${last4}`;
};

export const maskAccountNumber = (accNo) => {
  if (!accNo) return "XXXX XXXX 0000";
  const cleaned = String(accNo).trim();
  if (cleaned.length <= 4) return cleaned;
  const last4 = cleaned.slice(-4);
  return `A/C •••• ${last4}`;
};

export const maskCVV = () => "***";
