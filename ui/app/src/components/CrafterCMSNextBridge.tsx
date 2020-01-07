/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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

import React, { Suspense, useEffect, useState } from 'react';
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { theme } from '../styles/theme';
import { updateIntl } from '../utils/codebase-bridge';
import en from '../translations/locales/en.json';
import es from '../translations/locales/es.json';
import de from '../translations/locales/de.json';
import ko from '../translations/locales/ko.json';
import { setRequestForgeryToken } from '../utils/auth';
import { Provider } from 'react-redux';
import store from '../state/store';
import AuthMonitor from './SystemStatus/AuthMonitor';

const Locales: any = {
  en,
  es,
  de,
  ko,
  kr: ko // TODO: Currently studio uses the wrong code for korean
};

export let intl = getIntl(getCurrentLocale());

// @ts-ignore
document.addEventListener('setlocale', (e: CustomEvent<string>) => {
  intl = getIntl(e.detail);
  updateIntl(intl);
  document.documentElement.setAttribute('lang', e.detail);
}, false);

function getIntl(locale: string) {
  return createIntl({
    locale: locale,
    messages: Locales[locale] || en
  }, createIntlCache());
}

function getCurrentLocale() {
  const username = localStorage.getItem('userName');
  const locale = username
    ? localStorage.getItem(`${username}_crafterStudioLanguage`)
    : localStorage.getItem(`crafterStudioLanguage`);
  return locale ? locale : 'en';
}

function CrafterCMSNextBridge(props: any) {

  const [, update] = useState();

  useEffect(setRequestForgeryToken, []);
  useEffect(() => setUpLocaleChangeListener(update), [update]);

  return (
    <Provider store={store}>
      <RawIntlProvider value={intl}>
        <ThemeProvider theme={theme}>
          <Suspense fallback="">
            {props.children}
          </Suspense>
          <AuthMonitor/>
        </ThemeProvider>
      </RawIntlProvider>
    </Provider>
  );

}

function setUpLocaleChangeListener(update) {
  const handler = (e: any) => update({});
  document.addEventListener('setlocale', handler, false);
  return () => document.removeEventListener('setlocale', handler, false);
}

export default CrafterCMSNextBridge;
