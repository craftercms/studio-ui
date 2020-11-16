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

import React, { PropsWithChildren, Suspense, useLayoutEffect, useState } from 'react';
import { ThemeOptions } from '@material-ui/core/styles';
import { setRequestForgeryToken } from '../utils/auth';
import { CrafterCMSStore, createStore } from '../state/store';
import GlobalDialogManager from './SystemStatus/GlobalDialogManager';
import { SnackbarProvider } from 'notistack';
import { createResource } from '../utils/hooks';
import { Resource } from '../models/Resource';
import Suspencified from './SystemStatus/Suspencified';
import I18nProvider from './I18nProvider';
import StoreProvider from './StoreProvider';
import CrafterThemeProvider from './CrafterThemeProvider';

function Bridge(
  props: PropsWithChildren<{
    mountGlobalDialogManager?: boolean;
    resource: Resource<CrafterCMSStore>;
    themeOptions?: ThemeOptions;
  }>
) {
  const mountGlobalDialogManager = props.mountGlobalDialogManager ?? true;
  useLayoutEffect(setRequestForgeryToken, []);
  return (
    <StoreProvider resource={props.resource}>
      <I18nProvider>
        <CrafterThemeProvider themeOptions={props.themeOptions}>
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
        </CrafterThemeProvider>
      </I18nProvider>
    </StoreProvider>
  );
}

export default function CrafterCMSNextBridge(props: PropsWithChildren<{ mountGlobalDialogManager?: boolean }>) {
  const [storeResource] = useState(() =>
    createResource(() => createStore(Boolean(process.env.REACT_APP_USE_MOCK_INITIAL_STATE)).toPromise())
  );
  return (
    <Suspencified>
      <Bridge
        mountGlobalDialogManager={props.mountGlobalDialogManager}
        resource={storeResource}
        children={props.children}
      />
    </Suspencified>
  );
}
