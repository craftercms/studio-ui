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

import React, { PropsWithChildren, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { StylesProvider, ThemeProvider } from '@material-ui/styles';
import { generateClassName, theme } from '../styles/theme';
import { setRequestForgeryToken } from '../utils/auth';
import { Provider } from 'react-redux';
import { CrafterCMSStore, createStore } from '../state/store';
import GlobalDialogManager from './SystemStatus/GlobalDialogManager';
import { SnackbarProvider } from 'notistack';
import { createResource } from '../utils/hooks';
import LoadingState from './SystemStatus/LoadingState';
import { Resource } from '../models/Resource';
import { intlRef } from '../utils/i18n';

const storeResource = createResource(() =>
  createStore(Boolean(process.env.REACT_APP_USE_MOCK_INITIAL_STATE)).toPromise()
);

function Bridge(
  props: PropsWithChildren<{ isLegacy?: boolean; resource: Resource<CrafterCMSStore> }>
) {
  const store = props.resource.read();

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
                {!props.isLegacy && <GlobalDialogManager />}
              </>
            </SnackbarProvider>
          </StylesProvider>
        </ThemeProvider>
      </RawIntlProvider>
    </Provider>
  );
}

function CrafterCMSNextBridge(props: PropsWithChildren<{ isLegacy?: boolean }>) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Bridge isLegacy={props.isLegacy} resource={storeResource} children={props.children} />
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

export default CrafterCMSNextBridge;
