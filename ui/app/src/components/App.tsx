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
import CrafterCMSNextBridge from './CrafterCMSNextBridge';

const AsyncVideoPlayer = React.lazy(() => import('./AsyncVideoPlayer'));

const playerOptions = {
  autoplay: true,
  controls: true,
  // src: 'http://vjs.zencdn.net/v/oceans.mp4',
  // src: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  // src: 'https://s3.amazonaws.com/_bc_dml/example-content/sintel_dash/sintel_vod.mpd',
  src: 'http://techslides.com/demos/sample-videos/small.3gp',
  width: 640,
  height: 480
};

function App() {
  return (
    <CrafterCMSNextBridge>
      <AsyncVideoPlayer
          playerOptions={ playerOptions }
          nonPlayableMessage={'The video is not ready to be played.'} />
    </CrafterCMSNextBridge>
  );
}

export default App;
