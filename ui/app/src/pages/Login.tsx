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
import { makeStyles } from 'tss-react/mui';
import LoginView, { LoginViewProps } from '../components/LoginView/LoginView';
import CrafterThemeProvider from '../components/CrafterThemeProvider';
import I18nProvider from '../components/I18nProvider';
import GlobalStyles from '../components/GlobalStyles';
import { UNDEFINED } from '../utils/constants';
import ErrorState from '../components/ErrorState';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const useStyles = makeStyles()(() => ({
  root: {
    height: '100%',
    background: 'url("/studio/static-assets/images/cogs.jpg") 0 0 no-repeat',
    backgroundSize: 'cover'
  },
  video: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    minWidth: '100%',
    position: 'fixed',
    minHeight: '100%'
  }
}));

export default function Login(props: LoginViewProps) {
  const { classes } = useStyles();
  const supportError = useMemo<string>(
    () =>
      'SharedWorker' in window
        ? UNDEFINED
        : ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
              navigator.platform
            )
          ? 'iOS is not supported as it lacks essential features. Please use Chrome or Firefox browsers on your desktop.'
          : 'Your browser is not supported as it lacks essential features. Please use Chrome or Firefox.',
    []
  );
  // **************************************************************************
  // TODO: To be enabled or removed depending on the background video decision.
  // **************************************************************************
  // const videoRef = useRef<HTMLVideoElement>();
  // useEffect(() => {
  //   const video = videoRef.current;
  //   video.playbackRate = .55;
  //   video.play();
  // }, []);
  return (
    <I18nProvider>
      <CrafterThemeProvider>
        <div className={classes.root}>
          {/*
          **************************************************************************
          TODO: To be enabled or removed depending on the background video decision.
          **************************************************************************
          <video
            loop
            muted
            ref={videoRef}
            // autoPlay
            id="loginVideo"
            preload="auto"
            className={classes.video}
            poster="/studio/static-assets/images/camera-moving-through-cogs.jpeg"
            src="/studio/static-assets/images/camera-moving-through-cogs.mp4"
          />
          */}
          {supportError ? (
            <Dialog open={true}>
              <DialogContent>
                <ErrorState
                  title={supportError}
                  imageUrl="/studio/static-assets/images/warning_state.svg"
                  styles={{ title: { textAlign: 'center' }, image: { width: 250, marginBottom: 10, marginTop: 10 } }}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <LoginView {...props} />
          )}
        </div>
        <GlobalStyles />
      </CrafterThemeProvider>
    </I18nProvider>
  );
}
