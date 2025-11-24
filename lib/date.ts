import { LOCALE_TIMEZONE_MAP } from '@/config/constants';
import { getLocaleFromCookie } from '@/lib/cookies';
import { CalendarDate, parseDate } from '@internationalized/date';

type DateInput = Date | string | number;

/**
 * Định dạng ngày và giờ theo locale
 * @param value Ngày hoặc chuỗi ngày để định dạng
 * @param options Options cho định dạng ngày
 * @returns Chuỗi ngày và giờ đã định dạng
 */
export function formatDateTimeByLocale(
  value: DateInput,
  options?: Intl.DateTimeFormatOptions & { locale?: string }
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const locale = options?.locale ?? getLocaleFromCookie();
  const timeZone =
    options?.timeZone ??
    LOCALE_TIMEZONE_MAP[locale] ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone,
    ...options,
  });

  return formatter.format(date);
}

/**
 * Parser ngày an toàn mà xử lý các định dạng ngày không hợp lệ
 * @param dateString Chuỗi ngày để phân tích
 * @returns CalendarDate hoặc null nếu phân tích thất bại
 */
export function safeParseDate(
  dateString: string | null | undefined
): CalendarDate | null {
  if (!dateString?.trim()) return null;

  try {
    return parseDate(dateString);
  } catch {
    // Fallback to JavaScript Date for other formats
    const jsDate = new Date(dateString);
    if (!isNaN(jsDate.getTime())) {
      return new CalendarDate(
        jsDate.getFullYear(),
        jsDate.getMonth() + 1,
        jsDate.getDate()
      );
    }
  }

  return null;
}

/**
 * Format CalendarDate thành chuỗi ngày theo định dạng YYYY-MM-DD
 * @param date CalendarDate để format
 * @returns Chuỗi ngày theo định dạng YYYY-MM-DD hoặc chuỗi rỗng nếu date là null
 */
export function formatCalendarDateToString(date: CalendarDate | null): string {
  if (!date) return '';
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}
