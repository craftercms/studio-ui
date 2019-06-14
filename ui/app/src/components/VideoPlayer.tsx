/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming';

import { PlayerOptions } from '../models/PlayerOptions';

const SourceTypes: { [key: string]: string } = {
  'mp4': 'video/mp4',
  'm3u8': 'application/x-mpegURL',
  'mpd': 'application/dash+xml'
};

class VideoPlayer extends React.Component {
  private player?: videojs.Player;
  private videoNode?: HTMLVideoElement;
  private videoJsOptions?: videojs.PlayerOptions;

  constructor(props: PlayerOptions) {
    super(props);
    this.player = undefined;
    this.videoNode = undefined;

    this.mapPropsToPlayerOptions(props);
  }

  componentDidMount() {
    // instantiate video.js
    this.player = videojs(this.videoNode, this.videoJsOptions);
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  mapPropsToPlayerOptions(props: PlayerOptions) {
    const extensionRegex = /(?:\.([^.]+))?$/,
          extension = (extensionRegex.exec(props.src))[1],
          type = SourceTypes[extension];

    this.videoJsOptions = {
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
    }
  }

  render() {
    return (
      <div data-vjs-player>
        <video ref={ node => this.videoNode = node } className="video-js"></video>
      </div>
    )
  }
}

export default VideoPlayer;
