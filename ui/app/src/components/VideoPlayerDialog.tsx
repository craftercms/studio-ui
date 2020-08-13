import React, { useEffect } from 'react';
import { Dialog } from '@material-ui/core';
import {
  ControlsBarVideoJSAdapter,
  Player,
  useVideoJSSource,
  useVideoJSVolume
} from '@craftercms/video';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export const getClasses = makeStyles((theme) => ({
  wrapper: {
    width: '100%'
  },
  video: {
    width: '100%'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
    zIndex: 1
  }
}));

type VideoPlayerDialogProps = React.PropsWithChildren<{
  id?: string;
  open: boolean;
  src: string;
  onClose(): void;
}>

export default function VideoPlayerDialog(props: VideoPlayerDialogProps) {
  const { open, onClose } = props;
  const classes = getClasses({});
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={'md'}
    >
      <VideoPlayerUI {...props} />
    </Dialog>
  );
}

function VideoPlayerUI(props: VideoPlayerDialogProps) {
  const { id = 'dialogPlayer', src, onClose } = props;
  const classes = getClasses({});
  const [volume, setVolume] = useVideoJSVolume(id);
  const [source, setSource] = useVideoJSSource(id);

  useEffect(() => {
    setSource(src);
  }, []);

  return (
    <>
      <IconButton
        aria-label="close"
        className={classes.closeButton}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
      <Player
        id={id}
        options={{ volume, muted: volume === 0 }}
        classes={{ wrapper: classes.wrapper, video: classes.video }}
      />
      <ControlsBarVideoJSAdapter
        id={id}
        skip={10}
        volume={volume}
        setVolume={setVolume}
        position={'relative'}
      />
    </>
  );
}
