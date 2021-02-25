import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MaximizeIcon from '@material-ui/icons/OpenInBrowserRounded';
import React from 'react';
import { ProgressBar } from './ProgressBar';
import LinearProgress from '@material-ui/core/LinearProgress';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      padding: '10px 14px',
      alignItems: 'center',
      marginLeft: '20px',
      position: 'relative',
      border: `1px solid ${theme.palette.divider}`
    },
    title: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    subtitle: {
      fontSize: '14px',
      marginLeft: '15px'
    },
    indeterminateProgressBar: {
      position: 'absolute',
      bottom: ' 0px',
      width: '100%',
      left: '0',
      borderBottomLeftRadius: '3px',
      borderBottomRightRadius: '3px'
    }
  })
);

interface MinimizedBarProps {
  title: string;
  subtitle?: string;
  status?: 'indeterminate' | number;
  onMaximized?(): void;
}

export function MinimizedBar(props: MinimizedBarProps) {
  const { title, onMaximized, subtitle, status } = props;
  const classes = useStyles({});
  return (
    <Paper className={classes.root} elevation={4}>
      <Typography variant="h6" children={title} />
      {subtitle && <Typography variant="subtitle1" className={classes.subtitle} children={subtitle} />}
      {onMaximized ? <IconButton aria-label="Maximize" onClick={onMaximized} children={<MaximizeIcon />} /> : null}
      {status === 'indeterminate' ? (
        <LinearProgress className={classes.indeterminateProgressBar} />
      ) : status ? (
        <ProgressBar progress={status} />
      ) : null}
    </Paper>
  );
}

export default MinimizedBar;
