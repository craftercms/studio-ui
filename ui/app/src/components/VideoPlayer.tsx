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

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming';

export interface VideoPlayerProps {
  src: string,
  autoplay?: boolean,
  controls?: boolean,
  height?: number,
  width?: number,
  muted?: boolean,
  poster?: string
}

enum SourceTypes {
  'mp4' = 'video/mp4',
  'm3u8' = 'application/x-mpegURL',
  'mpd' = 'application/dash+xml'
};

function VideoPlayer(props: VideoPlayerProps) {
  const
    videoNode = useRef(null),
    player = useRef(null),
    extensionRegex = /(?:\.([^.]+))?$/,
    extension = (extensionRegex.exec(props.src))[1],
    type = Object(SourceTypes)[extension],
    videoJsOptions: videojs.PlayerOptions = {
      autoplay: props.autoplay,
      controls: props.controls,
      height: props.height,
      width: props.width,
      muted: props.muted,
      poster: props.poster,
      sources: [
        {
          src: props.src,
          type: type
        }
      ]
    };

  useEffect(
    () => {
      player.current = videojs(videoNode.current, videoJsOptions);

      return () => {
        player.current.dispose();
      }
    },
    // eslint-disable-next-line
    []
  );

  return (
    <div data-vjs-player>
      <video ref={ videoNode } className="video-js"></video>
    </div>
  )
}

export default VideoPlayer;
