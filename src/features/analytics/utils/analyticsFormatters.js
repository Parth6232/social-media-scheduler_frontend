// NEW: Analytics formatting utilities for charts, numbers, dates, and i18n templates

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Replaces `{name}` tokens in template strings with values from params object
 */
export const tFormat = (template = '', params = {}) => {
  if (!template || typeof template !== 'string') return '';
  return Object.entries(params).reduce((acc, [key, val]) => {
    return acc.replaceAll(`{${key}}`, val !== undefined && val !== null ? String(val) : '');
  }, template);
};

/**
 * Format numbers with compact notation (e.g. 1.2K, 3.5M) for badges/KPIs
 */
export const formatCompactNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
};

/**
 * Format exact number with thousand separators (e.g. 1,234,567) for tooltips
 */
export const formatFullNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en').format(num);
};

/**
 * Convert 0-23 hour (IST) to 12-hour format string (e.g. 19 -> "7 PM", 0 -> "12 AM")
 */
export const formatHour = (hour) => {
  const h = Number(hour);
  if (isNaN(h)) return '';
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
};

/**
 * Safe date label formatting without timezone shift:
 * - 'YYYY-MM-DD' -> '29 Sep'
 * - 'YYYY-MM' -> 'Sep 2026'
 */
export const formatDateLabel = (dateStr, granularity = 'day') => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length >= 3 && granularity === 'day') {
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const month = MONTH_NAMES[monthIdx] || parts[1];
    return `${day} ${month}`;
  }
  if (parts.length >= 2) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const month = MONTH_NAMES[monthIdx] || parts[1];
    return `${month} ${year}`;
  }
  return dateStr;
};

/**
 * Format relative time (e.g. "15m ago", "2h ago", "yesterday")
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0 || isNaN(diffMs)) return 'just now';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};
