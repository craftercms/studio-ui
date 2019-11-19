import React, { useEffect, useMemo, useRef } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { fromEvent, NEVER, Observable } from 'rxjs';
import clsx from 'clsx';
import { StandardAction, getHostToGuestBus, usePreviewContext } from './previewContext';
import { DRAWER_WIDTH } from './previewContext';
import { filter, map, pluck } from 'rxjs/operators';
import { defineMessages, useIntl } from 'react-intl';

const message$ = fromEvent<MessageEvent>(window, 'message');

const useStyles = makeStyles((theme) => createStyles({
  iframe: {
    width: '100%',
    maxWidth: '100%',
    border: 'none',
    height: '100%',
    transition: 'width .25s ease, height .25s ease'
  },
  iframeWithBorder: {
    borderRadius: 20,
    borderColor: '#555',
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
    }),
    width: `calc(100% - ${DRAWER_WIDTH}px)`
  }
}));

const translations = defineMessages({
  iframeTitle: {
    id: 'preview.previewIFrameTitle',
    defaultMessage: 'Preview Frame'
  }
});

interface HostProps {
  url: string;
  className?: string;
  guestOrigin?: string;
  onMessage?: (value: StandardAction) => void;
  postMessage$?: Observable<StandardAction>;
  width?: string | number;
  height?: string | number;
  border?: 'portrait' | 'landscape';
}

export function HostUI(props: HostProps) {

  const classes = useStyles({});
  const { formatMessage } = useIntl();

  const {
    url,
    width,
    height,
    border,
    className,
    onMessage,
    postMessage$ = NEVER,
    guestOrigin = 'http://localhost:8080'
  } = props;
  const iframeRef = useRef(null);
  const cls = clsx(classes.iframe, {
    [className || '']: !!className,
    [classes.iframeWithBorder]: border != null,
    [classes.iframeWithBorderPortrait]: border === 'landscape',
    [classes.iframeWithBorderLandscape]: border === 'portrait'
  });

  useEffect(setUpGuestCommunications, [onMessage]);

  return (
    <>
      <iframe
        style={{ width, height }}
        id="crafterCMSPreviewIframe"
        title={formatMessage(translations.iframeTitle)}
        ref={iframeRef}
        src={url || 'about:blank'}
        className={cls}
      />
    </>
  );

  function setUpGuestCommunications() {

    const guestToHostSubscription = message$.pipe(
      filter((e) => e.data && (e.data.type || e.data.topic)),
      pluck('data'),
      map((data) => ({
        type: (data.type || data.topic),
        ...(data.message === undefined ? {} : { payload: data.message })
      }))
    ).subscribe(onMessage);

    const hostToGuestSubscription = postMessage$.subscribe((action) => {
      const contentWindow = iframeRef.current.contentWindow;
      contentWindow.postMessage({ topic: action.type, message: action.payload }, guestOrigin);
    });

    return () => {
      guestToHostSubscription.unsubscribe();
      hostToGuestSubscription.unsubscribe();
    };

  }

}

export default function Host() {

  const classes = useStyles({});
  const [{ showToolsPanel, hostSize }] = usePreviewContext();

  const hostToGuest$ = useMemo(() => getHostToGuestBus().asObservable(), []);
  const onMessage = useMemo(() => (action: StandardAction) => {
    const { type, payload } = action;
    switch (type) {
      case 'GUEST_SITE_LOAD':

    }
  }, []);

  return (
    <div className={clsx(classes.hostContainer, { [classes.shift]: showToolsPanel })}>
      <HostUI
        {...hostSize}
        onMessage={onMessage}
        postMessage$={hostToGuest$}
        url={'http://localhost:8080'}
      />
    </div>
  );

}
