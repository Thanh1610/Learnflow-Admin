export const LANGUAGES = [
  {
    key: 'en',
    label: 'English',
    countryCode: 'US',
  },
  {
    key: 'vi',
    label: 'Tiếng Việt',
    countryCode: 'VN',
  },
] as const;

export const LOCALE_TIMEZONE_MAP: Record<string, string> = {
  vi: 'Asia/Ho_Chi_Minh',
  'vi-VN': 'Asia/Ho_Chi_Minh',
  en: 'UTC',
  'en-US': 'America/New_York',
};

export const USER_ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  DEPT_ADMIN: 'DEPT_ADMIN',
  USER: 'USER',
} as const;
