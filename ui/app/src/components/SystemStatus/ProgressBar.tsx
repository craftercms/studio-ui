import clsx from 'clsx';
import React from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material';
import palette from '../../styles/palette';

const progressBarStyles = makeStyles((theme: Theme) =>
  createStyles({
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '3px',
      transition: 'height .2s'
    },
    progressBarInner: {
      backgroundColor: palette.blue.tint,
      height: '100%',
      width: 0,
      transition: 'width 0.4s ease',
      '&.complete': {
        transition: 'background-color 0.5s ease',
        backgroundColor: palette.green.main
      },
      '&.failed': {
        backgroundColor: palette.red.main
      }
    }
  })
);

export function ProgressBar(props: any) {
  const { status, progress } = props;
  const classes = progressBarStyles({});
  return (
    <div className={classes.progressBar}>
      <div
        className={clsx(classes.progressBarInner, status === 'failed' && 'failed', progress === 100 && 'complete')}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
