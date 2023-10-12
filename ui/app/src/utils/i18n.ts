/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { createIntl, createIntlCache, IntlShape } from 'react-intl';
import { Subject } from 'rxjs';
import TranslationOrText from '../models/TranslationOrText';
import { nou } from './object';
import { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import { ReactNode } from 'react';
import LookupTable from '../models/LookupTable';

export type BundledLocaleCodes = 'en' | 'es' | 'de' | 'ko';

/* private */
let currentTranslations = { en: {} };

let fetchedLocales: Partial<Record<BundledLocaleCodes, boolean>> = { en: true };

/* private */
const intl$$ = new Subject<IntlShape>();

/* public */
export const intl$ = intl$$.asObservable();

/* private */
let intl = createIntl({ locale: 'en', messages: currentTranslations.en }, createIntlCache());

if (getCurrentLocale() !== 'en') {
  createIntlInstance(getCurrentLocale()).then((newIntl) => {
    intl = newIntl;
    intl$$.next(newIntl);
  });
}

async function fetchLocale(locale: string): Promise<LookupTable<string>> {
  let translations;
  switch (locale) {
    case 'de':
      translations = await import('../translations/de.json');
      break;
    case 'es':
      translations = await import('../translations/es.json');
      break;
    case 'ko':
      translations = await import('../translations/ko.json');
      break;
    default:
      translations = Promise.resolve({});
      break;
  }
  return translations;
}

async function createIntlInstance(localeCode: string): Promise<IntlShape> {
  if (
    !fetchedLocales[localeCode] &&
    // Nothing to fetch point if we don't have the locale
    ['de', 'es', 'ko'].includes(localeCode)
  ) {
    let fetchedTranslations = await fetchLocale(localeCode as BundledLocaleCodes);
    // Plugins may have added translations to a locale that hasn't been fetched.
    currentTranslations[localeCode] = { ...currentTranslations[localeCode], ...fetchedTranslations };
    fetchedLocales[localeCode] = true;
  }
  return createIntl(
    {
      locale: localeCode,
      messages: currentTranslations[localeCode] || currentTranslations.en
    },
    createIntlCache()
  );
}

export function augmentTranslations(translations: { [localeCode: string]: object }): void {
  if (translations) {
    let currentLocale = intl.locale;
    let currentLocaleChanged = false;
    Object.entries(translations).forEach(([localeCode, translations]) => {
      currentTranslations[localeCode] = { ...currentTranslations[localeCode], ...translations };
      currentLocale === localeCode && (currentLocaleChanged = true);
    });
    if (currentLocaleChanged) {
      createIntlInstance(currentLocale).then((newIntl) => {
        intl = newIntl;
        intl$$.next(newIntl);
      });
    }
  }
}

export function getTranslation(key: string, table: any, formatMessage = (descriptor) => descriptor) {
  return formatMessage(
    table[key] || {
      id: 'translationNotAvailable',
      defaultMessage: key || '(check configuration)'
    }
  );
}

export function getPossibleTranslation(
  titleOrDescriptor: TranslationOrText,
  formatMessage: IntlShape['formatMessage'],
  // TODO: Fix FormatXMLElementFn generics
  values?: Record<string, PrimitiveType | FormatXMLElementFn<any, any>>
): string | ReactNode[] {
  if (nou(titleOrDescriptor)) {
    return null;
  }
  return typeof titleOrDescriptor === 'object' ? formatMessage(titleOrDescriptor, values) : titleOrDescriptor;
}

export function getCurrentLocale(username?: string): string {
  const user = username ?? localStorage.getItem('username');
  return getStoredLanguage(user) || 'en';
}

export function getCurrentIntl(): IntlShape {
  return intl;
}

export function buildStoredLanguageKey(username: string): string {
  return `${username}_crafterStudioLanguage`;
}

export function getStoredLanguage(username?: string): string {
  return (
    (username ? localStorage.getItem(buildStoredLanguageKey(username)) : null) ??
    localStorage.getItem(`crafterStudioLanguage`)
  );
}

export function setStoredLanguage(language: string, username?: string): void {
  // Prevent `null` or `undefined`, or even `"""` from being stored.
  if (language) {
    username && localStorage.setItem(buildStoredLanguageKey(username), language);
    localStorage.setItem('crafterStudioLanguage', language);
  }
}

export function dispatchLanguageChange(language: string): void {
  let event = new CustomEvent('setlocale', { detail: language });
  document.dispatchEvent(event);
}

// @ts-ignore
document.addEventListener(
  'setlocale',
  async (e: CustomEvent<string>) => {
    if (e.detail && e.detail !== intl.locale) {
      intl = await createIntlInstance(e.detail);
      document.documentElement.setAttribute('lang', e.detail);
      intl$$.next(intl);
    }
  },
  false
);
