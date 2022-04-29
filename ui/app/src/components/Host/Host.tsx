/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { useMemo } from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { getGuestToHostBus, getHostToGuestBus } from '../../utils/subjects';
import { StandardAction } from '../../models/StandardAction';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { usePreviewState } from '../../hooks/usePreviewState';
import { usePreviewNavigation } from '../../hooks/usePreviewNavigation';
import { useEnv } from '../../hooks/useEnv';
import { getComputedEditMode } from '../../utils/content';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useCurrentPreviewItem } from '../../hooks/useCurrentPreviewItem';
import HostUI from './HostUI';

const useStyles = makeStyles((theme) =>
  createStyles({
    hostContainer: {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f3f3',
      height: '100%',
      maxHeight: 'calc(100% - 64px)',
      overflow: 'auto',
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    shift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
      // width: `calc(100% - ${DRAWER_WIDTH}px)`,
      // marginLeft: DRAWER_WIDTH
    }
  })
);

export function Host() {
  const classes = useStyles();
  const site = useActiveSiteId();
  const { guestBase, previewLandingBase } = useEnv();
  const { hostSize, showToolsPanel, toolsPanelWidth, icePanelWidth, editMode } = usePreviewState();
  const { currentUrlPath } = usePreviewNavigation();
  const { username } = useActiveUser();
  const item = useCurrentPreviewItem();
  const isEditMode = getComputedEditMode({ item, editMode, username });

  const postMessage$ = useMemo(() => getHostToGuestBus().asObservable(), []);
  const onMessage = useMemo(() => {
    const guestToHost$ = getGuestToHostBus();
    return (action: StandardAction) => guestToHost$.next(action);
  }, []);

  return (
    <div
      style={{
        width: `calc(100% - ${showToolsPanel ? toolsPanelWidth : 0}px - ${isEditMode ? icePanelWidth : 0}px)`,
        marginLeft: showToolsPanel ? toolsPanelWidth : 0
      }}
      className={clsx(classes.hostContainer, { [classes.shift]: showToolsPanel })}
    >
      <HostUI
        url={currentUrlPath === '' ? previewLandingBase : `${guestBase}${currentUrlPath}`}
        site={site}
        width={hostSize.width}
        origin={guestBase}
        height={hostSize.height}
        onMessage={onMessage}
        postMessage$={postMessage$}
        onLocationChange={() => null}
      />
    </div>
  );
}

export default Host;
