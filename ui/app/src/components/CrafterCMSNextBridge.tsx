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

import '../styles/index.scss';

import React, { PropsWithChildren, Suspense, useEffect, useState } from 'react';
import { createIntl, createIntlCache, IntlShape, RawIntlProvider } from 'react-intl';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { theme } from '../styles/theme';
import { updateIntl } from '../utils/codebase-bridge';
import en from '../translations/locales/en.json';
import es from '../translations/locales/es.json';
import de from '../translations/locales/de.json';
import ko from '../translations/locales/ko.json';
import { createGenerateClassName, StylesProvider } from '@material-ui/core';

const Locales: any = {
  en,
  es,
  de,
  ko,
  kr: ko // TODO: Currently studio uses the wrong code for korean
};

export let intl = getIntl(getCurrentLocale());

// @ts-ignore
document.addEventListener(
  'setlocale',
  (e: CustomEvent<string>) => {
    if (e.detail && e.detail !== intl.locale) {
      intl = getIntl(e.detail);
      updateIntl(intl);
      document.documentElement.setAttribute('lang', e.detail);
    }
  },
  false
);

function getIntl(locale: string): IntlShape {
  return createIntl(
    {
      locale: locale,
      messages: Locales[locale] || en
    },
    createIntlCache()
  );
}

export function getCurrentLocale() {
  const username = localStorage.getItem('userName');
  const locale = username
    ? localStorage.getItem(`${username}_crafterStudioLanguage`)
    : localStorage.getItem(`crafterStudioLanguage`);
  return locale ? locale : 'en';
}

const generateClassName = createGenerateClassName({
  productionPrefix: 'craftercms-'
});

function CrafterCMSNextBridge(props: PropsWithChildren<{}>) {
  const [, update] = useState();

  useEffect(() => setUpLocaleChangeListener(update, intl), [update]);

  return (
    <RawIntlProvider value={intl}>
      <ThemeProvider theme={theme}>
        <StylesProvider generateClassName={generateClassName}>
          <Suspense fallback="">{props.children}</Suspense>
        </StylesProvider>
      </ThemeProvider>
    </RawIntlProvider>
  );
}

function setUpLocaleChangeListener(update: Function, currentIntl: IntlShape) {
  const handler = (e: any) => {
    if (currentIntl !== intl) {
      update({});
    }
  };
  document.addEventListener('setlocale', handler, false);
  return () => document.removeEventListener('setlocale', handler, false);
}

export default CrafterCMSNextBridge;
