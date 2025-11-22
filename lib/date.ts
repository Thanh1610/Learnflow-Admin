import { LOCALE_TIMEZONE_MAP } from '@/config/constants';
import { getLocaleFromCookie } from '@/lib/cookies';

type DateInput = Date | string | number;

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
