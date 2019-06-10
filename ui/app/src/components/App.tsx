import React from 'react';
import AsyncVideoPlayer from './AsyncVideoPlayer';

function App() {
  return (
    <AsyncVideoPlayer nonPlayableMessage={'The video is not ready to be played.'}/>
  );
}

export default App;
