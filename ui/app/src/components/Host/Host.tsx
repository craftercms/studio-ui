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

import React, { useEffect, useRef } from 'react';
import { getGuestToHostBus, getHostToGuestBus } from '../../utils/subjects';
import { StandardAction } from '../../models/StandardAction';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { usePreviewState } from '../../hooks/usePreviewState';
import { usePreviewNavigation } from '../../hooks/usePreviewNavigation';
import { useEnv } from '../../hooks/useEnv';
import Box from '@mui/material/Box';
import { filter, map } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

export function Host() {
  const site = useActiveSiteId();
  const { guestBase, previewLandingBase } = useEnv();
  const {
    hostSize,
    showToolsPanel: leftSideBarOpen,
    toolsPanelWidth: leftSideBarWidth,
    icePanelWidth: rightSideBarWidth,
    editMode: rightSideBarOpen
  } = usePreviewState();
  const { currentUrlPath } = usePreviewNavigation();
  const iframeRef = useRef<React.ElementRef<'iframe'>>(null);
  const url = currentUrlPath === '' ? previewLandingBase : `${guestBase}${currentUrlPath}`;
  const eitherSideBarOpen = leftSideBarOpen || rightSideBarOpen;

  useEffect(() => {
    const guestToHost$ = getGuestToHostBus();
    const guestToHostSubscription = fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filter((e) => Boolean(e.data?.meta?.craftercms)),
        map(({ data }) =>
          data.type
            ? data
            : {
                type: data.topic,
                payload: data.message
              }
        )
      )
      .subscribe((action: StandardAction) => guestToHost$.next(action));

    const hostToGuestSubscription = getHostToGuestBus()
      .asObservable()
      .pipe(map((action) => ({ ...action, craftercms: true, source: 'host' })))
      .subscribe((action) => {
        const contentWindow = iframeRef.current.contentWindow;
        contentWindow.postMessage(action, '*');
      });

    return () => {
      guestToHostSubscription.unsubscribe();
      hostToGuestSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      if (iframeRef.current.contentDocument.location.href !== url) {
        iframeRef.current.src = url;
      }
    } catch {
      iframeRef.current.src = url;
    }
  }, [url, site]);

  return (
    <Box
      sx={(theme) => ({
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        maxHeight: 'calc(100% - 64px)',
        marginBottom: '5px',
        zIndex: theme.zIndex.drawer + 1,
        background: theme.palette.background.default,
        height: '100%',
        // Want to leave 5px margin on the sides where the sidebar is hidden for the shadows to show appreciably.
        marginLeft: leftSideBarOpen ? `${leftSideBarWidth}px` : '5px',
        marginRight: rightSideBarOpen ? `${rightSideBarWidth}px` : '5px',
        transition: eitherSideBarOpen
          ? theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen
            })
          : theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            })
      })}
    >
      <Box
        key={site}
        ref={iframeRef}
        component="iframe"
        id="crafterCMSPreviewIframe"
        title="Preview Frame"
        sx={{
          width: hostSize.width ?? '100%',
          height: hostSize.height ?? '100%',
          transition: 'width .25s ease, height .25s ease',
          maxWidth: '100%',
          border: 'none',
          margin: 'auto',
          boxShadow: 3,
          borderRadius: 3
        }}
      />
    </Box>
  );
}

export default Host;
