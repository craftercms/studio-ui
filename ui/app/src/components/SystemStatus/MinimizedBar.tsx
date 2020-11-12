import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import React from 'react';
import { MinimizedDialogStatus } from '../../models/MinimizedDialog';
import { ProgressBar } from './ProgressBar';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      padding: '10px 14px',
      alignItems: 'center',
      marginLeft: '20px',
      position: 'relative'
    },
    title: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    subtitle: {
      fontSize: '14px',
      marginLeft: '15px'
    }
  })
);

interface MinimizedBarProps {
  title: string;
  subtitle?: string;
  status?: MinimizedDialogStatus;

  onMaximized?(): void;
}

export function MinimizedBar(props: MinimizedBarProps) {
  const { title, onMaximized, subtitle, status } = props;
  const classes = useStyles({});
  return (
    <Paper className={classes.root}>
      <Typography variant="h6">{title}</Typography>
      {subtitle && (
        <Typography variant="subtitle1" className={classes.subtitle}>
          {subtitle}
        </Typography>
      )}
      {onMaximized ? (
        <IconButton aria-label="close" onClick={onMaximized}>
          <AddRoundedIcon />
        </IconButton>
      ) : null}
      {status && <ProgressBar status={status.status} progress={status.progress} />}
    </Paper>
  );
}
