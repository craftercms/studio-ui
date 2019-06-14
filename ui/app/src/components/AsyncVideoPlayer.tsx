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

import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { AsyncVideoPlayerProps } from '../models/AsyncVideoPlayerProps';
import { PlayerOptions } from '../models/PlayerOptions';
import '../styles/async-video-player.scss';

function AsyncVideoPlayer(props: AsyncVideoPlayerProps) {

  const
    {
      playerOptions,
      nonPlayableMessage
    } = props,
    [playable, setPlayable] = useState(null),
    renderPlayer = function(playerOptions: PlayerOptions, nonPlayableMessage: string) {

      const playerStyle = {
        height: playerOptions.height ? playerOptions.height : 150,
        width: playerOptions.width ? playerOptions.width : 300
      };

      if ( playable ) {
        return (
          <section className="async-video-player"><VideoPlayer {...playerOptions}/></section>
        );
      } else {
        if ( playable === null ) {
          return (
            <div className="async-video-player--loading" style={playerStyle}>Loading...</div>
          );
        } else {
          return (
            <div className="async-video-player--unavailable-message" style={playerStyle}>{ nonPlayableMessage }</div>
          );
        }
      }
    };

  useEffect(
    () => {
      // async request to check for 404
      // if response is 200 setPlayable(true)
      fetch(playerOptions.src)
        .then(function(response) {
          if ( response.status === 200 ) {
            setPlayable(true);
          } else {
            setPlayable(false);
          }
        }).catch(function(){
          setPlayable(false);
        });
    },
    []
  );

  return (
    <>
      {
        renderPlayer(playerOptions, nonPlayableMessage)
      }
    </>
  );
}

export default AsyncVideoPlayer;
