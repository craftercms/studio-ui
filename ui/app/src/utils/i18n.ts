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
import { updateIntl } from './codebase-bridge';
import { createIntl, createIntlCache, IntlShape } from 'react-intl';

const Locales: any = {
  en,
  es,
  de,
  ko,
  kr: ko // TODO: Currently studio uses the wrong code for korean
};

export function getTranslation(key: string, table: any, formatMessage = (descriptor) => descriptor) {
  return formatMessage(table[key] || {
    id: 'translationNotAvailable',
    defaultMessage: (key || '(check configuration)')
  });
}

export const intlRef = { current: getIntl(getCurrentLocale()) };

function getIntl(locale: string): IntlShape {
  return createIntl(
    {
      locale: locale,
      messages: Locales[locale] || en
    },
    createIntlCache()
  );
}

export function getCurrentLocale(): string {
  const username = localStorage.getItem('userName');
  const locale = username
    ? localStorage.getItem(`${username}_crafterStudioLanguage`)
    : localStorage.getItem(`crafterStudioLanguage`);
  return locale ? locale : 'en';
}

// @ts-ignore
document.addEventListener(
  'setlocale',
  (e: CustomEvent<string>) => {
    if (e.detail && e.detail !== intlRef.current.locale) {
      intlRef.current = getIntl(e.detail);
      updateIntl(intlRef.current);
      document.documentElement.setAttribute('lang', e.detail);
    }
  },
  false
);
