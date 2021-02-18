/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import en from '../translations/locales/en.json';
import es from '../translations/locales/es.json';
import de from '../translations/locales/de.json';
import ko from '../translations/locales/ko.json';
import { createIntl, createIntlCache, IntlShape } from 'react-intl';
import { Subject } from 'rxjs';
import TranslationOrText from '../models/TranslationOrText';

export type BundledTranslationsLocaleCodes = 'en' | 'es' | 'de' | 'ko';

export type BundledTranslations = { [T in BundledTranslationsLocaleCodes | 'kr']: object };

/* private */
const bundledTranslations: BundledTranslations = {
  en,
  es,
  de,
  ko,
  kr: ko // TODO: Currently old studio UI uses the wrong code for korean
};

/* private */
const intl$$ = new Subject<IntlShape>();

/* public */
export const intl$ = intl$$.asObservable();

/* private */
let currentTranslations = bundledTranslations;

/* private */
let intl = createIntlInstance(getCurrentLocale());

function createIntlInstance(locale: string): IntlShape {
  return createIntl(
    {
      locale: locale,
      messages: currentTranslations[locale] || en
    },
    createIntlCache()
  );
}

export function augmentTranslations(translations: { [localeCode: string]: object }): void {
  if (translations) {
    const nextCurrentTranslations = { ...currentTranslations };
    Object.entries(translations).forEach(([locale, translations]) => {
      nextCurrentTranslations[locale] = { ...nextCurrentTranslations[locale], ...translations };
    });
    currentTranslations = nextCurrentTranslations;
    intl = createIntlInstance(intl.locale);
    intl$$.next(intl);
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

export function getPossibleTranslation(titleOrDescriptor: TranslationOrText, formatMessage): string {
  return typeof titleOrDescriptor === 'object' ? formatMessage(titleOrDescriptor) : titleOrDescriptor;
}

export function getCurrentLocale(): string {
  return getStoredLanguage(localStorage.getItem('username')) || 'en';
}

export function getCurrentIntl(): IntlShape {
  return intl;
}

export function getBundledTranslations(): BundledTranslations {
  return bundledTranslations;
}

export function buildStoredLanguageKey(username: string): string {
  return `${username}_crafterStudioLanguage`;
}

export function getStoredLanguage(username?: string): string {
  return localStorage.getItem(buildStoredLanguageKey(username)) ?? localStorage.getItem(`crafterStudioLanguage`);
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
  (e: CustomEvent<string>) => {
    if (e.detail && e.detail !== intl.locale) {
      intl = createIntlInstance(e.detail);
      document.documentElement.setAttribute('lang', e.detail);
      intl$$.next(intl);
    }
  },
  false
);
