import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2),
  },
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    background: '#fff',
    transform: 'translate(-50%, -50%)',
  }
}));

export default function Spinner() {
  // @ts-ignore
  const classes = useStyles();
  return (
    <div className={classes.center}>
      <CircularProgress className={classes.progress} />
    </div>
  );
}
