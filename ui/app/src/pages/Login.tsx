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

import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import LoginView, { LoginViewProps } from '../components/SystemStatus/LoginView';

const useStyles = makeStyles(() =>
  createStyles({
    '@global': {
      'html, body, #root, #studioSPARoot': {
        margin: 0,
        padding: 0,
        height: '100%'
      }
    },
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
  })
);

export default function Login(props: LoginViewProps) {
  const classes = useStyles({});
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
      <LoginView {...props} />
    </div>
  );
}
