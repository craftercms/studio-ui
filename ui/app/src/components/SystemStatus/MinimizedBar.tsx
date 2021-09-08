import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MaximizeIcon from '@mui/icons-material/OpenInBrowserRounded';
import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';

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
  const classes = useStyles();
  return (
    <Paper className={classes.root} elevation={4}>
      <Box>
        <Typography variant="body1" children={title} />
        {subtitle && <Typography variant="body2" className={classes.subtitle} children={subtitle} />}
      </Box>
      {onMaximized ? (
        <IconButton aria-label="Maximize" onClick={onMaximized} children={<MaximizeIcon />} size="large" />
      ) : null}
      {status && (
        <LinearProgress
          className={classes.indeterminateProgressBar}
          variant={status === 'indeterminate' ? 'indeterminate' : 'determinate'}
          value={status === 'indeterminate' ? null : status}
        />
      )}
    </Paper>
  );
}

export default MinimizedBar;
