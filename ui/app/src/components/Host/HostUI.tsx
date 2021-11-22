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

import { fromEvent, NEVER, Observable } from 'rxjs';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { defineMessages, useIntl } from 'react-intl';
import { StandardAction } from '../../models/StandardAction';
import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { filter, map, pluck } from 'rxjs/operators';

const message$ = fromEvent<MessageEvent>(window, 'message');

const useStyles = makeStyles((theme) =>
  createStyles({
    iframe: {
      width: '100%',
      maxWidth: '100%',
      border: 'none',
      height: '100%',
      transition: 'width .25s ease, height .25s ease'
    },
    iframeWithBorder: {
      borderRadius: 20,
      borderColor: '#555'
    },
    iframeWithBorderLandscape: {
      borderWidth: '10px 50px'
    },
    iframeWithBorderPortrait: {
      borderWidth: '50px 10px'
    },
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

const meta = { craftercms: true, source: 'host' };

const translations = defineMessages({
  iframeTitle: {
    id: 'preview.previewIFrameTitle',
    defaultMessage: 'Preview Frame'
  }
});

export interface HostPropsUI {
  url: string;
  site: string;
  onLocationChange: () => void;
  className?: string;
  origin: string;
  onMessage?: (value: StandardAction) => void;
  postMessage$?: Observable<StandardAction>;
  width?: string | number;
  height?: string | number;
  border?: 'portrait' | 'landscape';
}

export function HostUI(props: HostPropsUI) {
  const classes = useStyles();
  const { formatMessage } = useIntl();

  const { url, site, width, origin, height, border, className, onMessage, postMessage$ = NEVER } = props;
  const iframeRef = useRef(null);
  const cls = clsx(classes.iframe, {
    [className || '']: !!className,
    [classes.iframeWithBorder]: border != null,
    [classes.iframeWithBorderPortrait]: border === 'landscape',
    [classes.iframeWithBorderLandscape]: border === 'portrait'
  });

  useEffect(() => {
    const guestToHostSubscription = message$
      .pipe(
        filter((e) => Boolean(e.data?.meta?.craftercms)),
        pluck('data'),
        map((data) =>
          data.type
            ? data
            : {
                type: data.topic,
                payload: data.message
              }
        )
      )
      .subscribe(onMessage);

    const hostToGuestSubscription = postMessage$.pipe(map((action) => ({ ...action, meta }))).subscribe((action) => {
      const contentWindow = iframeRef.current.contentWindow;
      contentWindow.postMessage(action, '*');
    });

    return () => {
      guestToHostSubscription.unsubscribe();
      hostToGuestSubscription.unsubscribe();
    };
  }, [origin, onMessage, postMessage$]);

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
    <>
      <iframe
        key={site}
        style={{ width, height }}
        id="crafterCMSPreviewIframe"
        title={formatMessage(translations.iframeTitle)}
        ref={iframeRef}
        className={cls}
      />
    </>
  );
}

export default HostUI;
