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
import { makeStyles, ThemeOptions } from '@material-ui/core/styles';
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
import SnackbarCloseButton from './SnackbarCloseButton';
import LegacyConcierge from './LegacyConcierge';

const useStyles = makeStyles({
  topSnackbar: {
    top: '80px'
  }
});

function Bridge(
  props: PropsWithChildren<{
    mountGlobalDialogManager?: boolean;
    mountSnackbarProvider?: boolean;
    mountLegacyConcierge?: boolean;
    resource: Resource<CrafterCMSStore>;
    themeOptions?: ThemeOptions;
  }>
) {
  useLayoutEffect(setRequestForgeryToken, []);
  const classes = useStyles();
  const mountGlobalDialogManager = props.mountGlobalDialogManager ?? true;
  const mountSnackbarProvider = props.mountSnackbarProvider ?? true;
  const mountLegacyConcierge = props.mountLegacyConcierge ?? false;

  const body = (
    <>
      <Suspense fallback="" children={props.children} />
      {mountGlobalDialogManager && <GlobalDialogManager />}
      {mountLegacyConcierge && <LegacyConcierge />}
    </>
  );
  return (
    <StoreProvider resource={props.resource}>
      <I18nProvider>
        <CrafterThemeProvider themeOptions={props.themeOptions}>
          {mountSnackbarProvider ? (
            <SnackbarProvider
              maxSnack={5}
              autoHideDuration={5000}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              action={(id) => <SnackbarCloseButton id={id} />}
              children={body}
              classes={{
                containerAnchorOriginTopRight: classes.topSnackbar,
                containerAnchorOriginTopLeft: classes.topSnackbar
              }}
            />
          ) : (
            body
          )}
        </CrafterThemeProvider>
      </I18nProvider>
    </StoreProvider>
  );
}

export default function CrafterCMSNextBridge(
  props: PropsWithChildren<{
    mountGlobalDialogManager?: boolean;
    mountSnackbarProvider?: boolean;
    mountLegacyConcierge?: boolean;
  }>
) {
  const [storeResource] = useState(() =>
    createResource(() => createStore(Boolean(process.env.REACT_APP_USE_MOCK_INITIAL_STATE)).toPromise())
  );
  return (
    <Suspencified>
      <Bridge
        mountGlobalDialogManager={props.mountGlobalDialogManager}
        mountSnackbarProvider={props.mountSnackbarProvider}
        mountLegacyConcierge={props.mountLegacyConcierge}
        resource={storeResource}
        children={props.children}
      />
    </Suspencified>
  );
}
