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

import React, { PropsWithChildren, Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { createMuiTheme, StylesProvider, ThemeOptions, ThemeProvider } from '@material-ui/core/styles';
import { defaultThemeOptions, generateClassName } from '../styles/theme';
import { setRequestForgeryToken } from '../utils/auth';
import { Provider } from 'react-redux';
import { CrafterCMSStore, createStore } from '../state/store';
import GlobalDialogManager from './SystemStatus/GlobalDialogManager';
import { SnackbarProvider } from 'notistack';
import { createResource } from '../utils/hooks';
import LoadingState from './SystemStatus/LoadingState';
import { Resource } from '../models/Resource';
import { intlRef } from '../utils/i18n';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const storeResource = createResource(() =>
  createStore(Boolean(process.env.REACT_APP_USE_MOCK_INITIAL_STATE)).toPromise()
);

function Bridge(
  props: PropsWithChildren<{
    mountGlobalDialogManager?: boolean;
    resource: Resource<CrafterCMSStore>;
    themeOptions?: ThemeOptions;
  }>
) {
  const store = props.resource.read();
  const mountGlobalDialogManager = props.mountGlobalDialogManager ?? true;
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () =>
      createMuiTheme({
        ...(props.themeOptions ?? defaultThemeOptions),
        palette: {
          ...(props.themeOptions ?? defaultThemeOptions).palette,
          type: prefersDarkMode ? 'dark' : 'light'
        }
      }),
    [prefersDarkMode, props.themeOptions]
  );

  const [, update] = useState();
  useLayoutEffect(setRequestForgeryToken, []);
  useEffect(() => setUpLocaleChangeListener(update, intlRef.current), [update]);

  return (
    <Provider store={store}>
      <RawIntlProvider value={intlRef.current}>
        <ThemeProvider theme={theme}>
          <StylesProvider generateClassName={generateClassName}>
            <SnackbarProvider
              maxSnack={5}
              autoHideDuration={5000}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <>
                <Suspense fallback="" children={props.children} />
                {mountGlobalDialogManager && <GlobalDialogManager />}
              </>
            </SnackbarProvider>
          </StylesProvider>
        </ThemeProvider>
      </RawIntlProvider>
    </Provider>
  );
}

export default function CrafterCMSNextBridge(props: PropsWithChildren<{ mountGlobalDialogManager?: boolean }>) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Bridge
        mountGlobalDialogManager={props.mountGlobalDialogManager}
        resource={storeResource}
        children={props.children}
      />
    </Suspense>
  );
}

function setUpLocaleChangeListener(update: Function, currentIntl: IntlShape) {
  const handler = (e: any) => {
    if (currentIntl !== intlRef.current) {
      update({});
    }
  };
  document.addEventListener('setlocale', handler, false);
  return () => document.removeEventListener('setlocale', handler, false);
}
