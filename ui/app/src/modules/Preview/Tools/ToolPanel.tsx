import { selectTool, usePreviewContext } from '../previewContext';
import { MessageDescriptor, useIntl } from 'react-intl';
import React, { FunctionComponent, PropsWithChildren, ReactElement } from 'react';
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
  }
}));

type ToolPanelProps = PropsWithChildren<{ title: string | MessageDescriptor; }>;

interface PanelHeaderProps {
  title: string;
  onBack: () => void
}

export const PanelHeader: FunctionComponent<PanelHeaderProps> = (props) => {
  const classes = useStyles({});
  const { title, onBack } = props;
  return (
    <>
      <header className={classes.panelHeader}>
        <IconButton onClick={onBack}>
          <ChevronLeftRounded/>
        </IconButton>
        <Typography component="h2">
          {title}
        </Typography>
      </header>
      <Divider/>
    </>
  );
};

export function ToolPanel(props: ToolPanelProps): ReactElement | null {
  const [, dispatch] = usePreviewContext();
  const { formatMessage } = useIntl();
  const { title } = props;
  return (
    <>
      <PanelHeader
        title={typeof title === 'string' ? title : formatMessage(title)}
        onBack={() => dispatch(selectTool())}
      />
      <section>
        {props.children}
      </section>
    </>
  );
}

export default ToolPanel;
