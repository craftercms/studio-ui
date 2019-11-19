import { selectTool, usePreviewContext } from '../previewContext';
import { useIntl } from 'react-intl';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import ChevronLeftRounded from '@material-ui/icons/ChevronLeftRounded';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme: Theme) => createStyles({
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start'
  },
  panelTitle: {},
  panelBody: {},
}));

export function PanelHeader(props: any) {
  const classes = useStyles({});
  const { title, onBack } = props;
  return (
    <>
      <header className={classes.panelHeader}>
        <IconButton onClick={onBack}>
          <ChevronLeftRounded/>
        </IconButton>
        <Typography component="h2" className={classes.panelTitle}>
          {title}
        </Typography>
      </header>
      <Divider/>
    </>
  );
}

export function ToolPanel(props: any) {
  const classes = useStyles({});
  const [, dispatch] = usePreviewContext();
  const { formatMessage } = useIntl();
  const { title } = props;
  return (
    <>
      <PanelHeader
        title={formatMessage(title)}
        onBack={() => dispatch(selectTool())}
      />
      <section className={classes.panelBody}>
        {props.children}
      </section>
    </>
  );
}

export default ToolPanel;
