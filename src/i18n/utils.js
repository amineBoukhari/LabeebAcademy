import { ui, defaultLocale, routes } from './config.js';

export function getLocale(url) {
  const seg = url.pathname.split('/').filter(Boolean)[0];
  return seg === 'ar' ? 'ar' : defaultLocale;
}

export function useTranslations(locale) {
  const table = ui[locale] ?? ui[defaultLocale];
  return (key) => table[key] ?? ui[defaultLocale][key] ?? key;
}

/** Locale-aware href: path('online', 'ar') -> /ar/formations-en-ligne */
export function path(key, locale = defaultLocale) {
  const slug = routes[key] ?? key;
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return slug ? `${prefix}/${slug}` : prefix || '/';
}

export function dirFor(locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
