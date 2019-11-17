import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ToolsPanel from './ToolsPanel';
import { PreviewProvider } from './previewContext';
import Host from './Host';
import ToolBar from './ToolBar';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }
}));

export default function Preview() {
  const classes = useStyles({});
  return (
    <PreviewProvider>
      <section className={classes.root}>
        <ToolBar />
        <Host />
        <ToolsPanel />
      </section>
    </PreviewProvider>
  );
}
