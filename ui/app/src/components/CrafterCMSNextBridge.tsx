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
import { getCurrentIntl, intl$ } from '../utils/i18n';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { SnackbarCloseButton } from './SnackbarCloseButton/SnackbarCloseButton';
import { delay } from 'rxjs/operators';

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
  const [intl, setIntl] = useState<IntlShape>(getCurrentIntl());
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

  useLayoutEffect(setRequestForgeryToken, []);
  useEffect(() => {
    // When plugins load and register translations, react may be
    // in the middle of a render cycle (via Widget) and throws
    // if we dispatch this immediately — hence the delay.
    const sub = intl$.pipe(delay(0)).subscribe(setIntl);
    return () => sub.unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <RawIntlProvider value={intl}>
        <ThemeProvider theme={theme}>
          <StylesProvider generateClassName={generateClassName}>
            <SnackbarProvider
              maxSnack={5}
              autoHideDuration={5000}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              action={(id) => <SnackbarCloseButton id={id} />}
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
