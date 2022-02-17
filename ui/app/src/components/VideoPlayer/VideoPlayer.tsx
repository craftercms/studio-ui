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
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export interface VideoPlayerProps {
  src: string;
  autoplay?: boolean;
  controls?: boolean;
  height?: number;
  width?: number;
  muted?: boolean;
  poster?: string;
}

const SourceTypes = {
  mp4: 'video/mp4',
  m3u8: 'application/x-mpegURL',
  mpd: 'application/dash+xml'
};

const extensionRegex = /(?:\.([^.]+))?$/;

function VideoPlayer(props: VideoPlayerProps) {
  const videoNode = useRef(null);
  const player = useRef(null);

  useEffect(() => {
    const extension = extensionRegex.exec(props.src)[1];
    player.current = videojs(videoNode.current, {
      autoplay: props.autoplay,
      controls: props.controls,
      height: props.height,
      width: props.width,
      muted: props.muted,
      poster: props.poster,
      sources: [
        {
          src: props.src,
          type: SourceTypes[extension]
        }
      ]
    });
    return () => {
      player.current.dispose();
    };
  }, [props.autoplay, props.controls, props.height, props.width, props.muted, props.poster, props.src]);

  return <video ref={videoNode} className="video-js" />;
}

export default VideoPlayer;
