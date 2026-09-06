function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * Build a wa.me link with prefilled text.
 * Strips all non-digits so " +91 99719 89908 " → "919971989908".
 */
export function waLink(number: string, text: string): string {
  const digits = digitsOnly(number);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/**
 * Build a tel: link. Always prefix with +.
 */
export function telLink(number: string): string {
  const digits = digitsOnly(number);
  return `tel:+${digits}`;
}

/**
 * Human-readable display for phone numbers.
 * - 12 digits starting with 91 → +91 99719 89908
 * - 10 digits → +91 99719 89908 (assume India if no country code)
 * - fallback → +digits
 */
export function formatDisplay(number: string): string {
  const digits = digitsOnly(number);
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 11 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return `+${digits}`;
}
