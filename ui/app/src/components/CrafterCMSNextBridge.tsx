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
import { theme } from "../styles/theme";
import { updateIntl } from '../utils/codebase-bridge';
import en from '../translations/locales/en.json';
import es from '../translations/locales/es.json';
import de from '../translations/locales/de.json';
import ko from '../translations/locales/ko.json';

const Locales: any = {
  en,
  es,
  de,
  ko
};

export let intl = getIntl(getCurrentLocale());

// @ts-ignore
document.addEventListener('setlocale', (e: CustomEvent<string>) => {
  intl = getIntl(e.detail);
  updateIntl(intl);
}, false);

function getIntl(locale: string) {
  return createIntl({
    locale: locale,
    messages: Locales[locale] || en
  }, createIntlCache());
}

function getCurrentLocale() {
  // TODO: get from storage, user, generic or default to 'en'
  // Remember to check username in the distinct ways it could be set in user
  // dashboard vs other parts of the system (i.e. preview, site config, etc)
  // const username = localStorage.getItem('userName');
  // const locale = username
  //   ? localStorage.getItem(`${username}_crafterStudioLanguage`) 
  //   : localStorage.getItem(`crafterStudioLanguage`);
  return 'en';
}

function CrafterCMSNextBridge(props: any) {

  // When codebase bridge goes away...
  // const [locale, setLocale] = useState(getCurrentLocale());
  // const i18n = useMemo(() => createIntl({
  //   locale,
  //   messages: Locales[locale] || en
  // }, createIntlCache()), [locale]);
  // useEffect(() => {
  //   const handler = (e: any) => setLocale(e.detail);
  //   document.addEventListener('setlocale', handler, false);
  //   return () => document.removeEventListener('setlocale', handler, false);
  // }, [locale]);

  // While codebase bridge still in play: trick React
  // into re-rendering with the updated locale.
  const [, update] = useState();
  useEffect(() => {
    const handler = (e: any) => update({});
    document.addEventListener('setlocale', handler, false);
    return () => document.removeEventListener('setlocale', handler, false);
  }, [update]);

  return (
    <RawIntlProvider value={_intl}>
      <ThemeProvider theme={theme}>
        <Suspense fallback="">
          {props.children}
        </Suspense>
      </ThemeProvider>
    </RawIntlProvider>
  );
  
}

export default CrafterCMSNextBridge;
