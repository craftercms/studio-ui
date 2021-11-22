/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import '../../styles/index.scss';

import React, { PropsWithChildren, ReactNode, Suspense, useLayoutEffect, useState } from 'react';
import { DeprecatedThemeOptions } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { setRequestForgeryToken } from '../../utils/auth';
import { CrafterCMSStore, getStore } from '../../state/store';
import GlobalDialogManager from '../GlobalDialogManager/GlobalDialogManager';
import { SnackbarProvider } from 'notistack';
import { Resource } from '../../models/Resource';
import Suspencified from '../Suspencified/Suspencified';
import I18nProvider from '../I18nProvider';
import StoreProvider from '../StoreProvider';
import CrafterThemeProvider from '../CrafterThemeProvider';
import SnackbarCloseButton from '../SnackbarCloseButton';
import LegacyConcierge from '../LegacyConcierge/LegacyConcierge';
import { GenerateId } from 'jss';
import { createResource } from '../../utils/resource';
import { lastValueFrom } from 'rxjs';

const useStyles = makeStyles((theme) =>
  createStyles({
    topSnackbar: {
      top: '80px'
    }
  })
);

function Bridge(
  props: PropsWithChildren<{
    mountGlobalDialogManager?: boolean;
    mountSnackbarProvider?: boolean;
    mountLegacyConcierge?: boolean;
    resource: Resource<CrafterCMSStore>;
    themeOptions?: DeprecatedThemeOptions;
    generateClassName?: GenerateId;
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
      {mountSnackbarProvider ? (
        <SnackbarProvider
          maxSnack={5}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          action={(id) => <SnackbarCloseButton id={id} />}
          children={body}
          classes={{
            // TODO: For some reason, these classes are not getting applied by notistack.
            // containerAnchorOriginTopRight: classes.topSnackbar,
            // containerAnchorOriginTopLeft: classes.topSnackbar,
            // containerAnchorOriginTopCenter: classes.topSnackbar,
            containerRoot: classes.topSnackbar
          }}
        />
      ) : (
        body
      )}
    </StoreProvider>
  );
}

export default function CrafterCMSNextBridge(
  props: PropsWithChildren<{
    mountGlobalDialogManager?: boolean;
    mountSnackbarProvider?: boolean;
    mountLegacyConcierge?: boolean;
    generateClassName?: GenerateId;
    suspenseFallback?: ReactNode;
    themeOptions?: DeprecatedThemeOptions;
  }>
) {
  const [storeResource] = useState(() => createResource(() => lastValueFrom(getStore())));
  return (
    <CrafterThemeProvider themeOptions={props.themeOptions} generateClassName={props.generateClassName}>
      <I18nProvider>
        <Suspencified
          suspenseProps={
            props.suspenseFallback === void 0
              ? void 0
              : {
                  fallback: props.suspenseFallback
                }
          }
        >
          <Bridge
            generateClassName={props.generateClassName}
            mountGlobalDialogManager={props.mountGlobalDialogManager}
            mountSnackbarProvider={props.mountSnackbarProvider}
            mountLegacyConcierge={props.mountLegacyConcierge}
            resource={storeResource}
            children={props.children}
          />
        </Suspencified>
      </I18nProvider>
    </CrafterThemeProvider>
  );
}
