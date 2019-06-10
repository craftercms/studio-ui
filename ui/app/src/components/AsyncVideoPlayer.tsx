import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

interface AsycVideoPlayerProps {
  // list props...
  nonPlayableMessage: string;
}

function AsyncVideoPlayer(props: AsycVideoPlayerProps) {

  const
    {
      nonPlayableMessage
    } = props,
    [playable, setPlayable] = useState(false);

  useEffect(
    () => {
      // ComponentWillMount stuff here...

      // make async request to check for 404
      // if response is 200 setPlayable(true)

      return () => {
        // ComponentWillUnmount stuff here...
        // Remove return statement if not needed.
      }
    },
    []
  );

  return (
    <>
      {
        playable
          ? <VideoPlayer />
          : (
            <>
              {nonPlayableMessage}
            </>
          )
      }
    </>
  );
}

export default AsyncVideoPlayer;
