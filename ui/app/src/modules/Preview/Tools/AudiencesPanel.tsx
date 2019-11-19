import React from 'react';
import Typography from '@material-ui/core/Typography';
import ToolPanel from './ToolPanel';
import { defineMessages, FormattedMessage } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const translations = defineMessages({
  audiencesPanel: {
    id: 'craftercms.ice.audiences.title',
    defaultMessage: 'Audience Targeting'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  iframe: {
    width: '100%',
    maxWidth: '100%',
    border: 'none',
    height: '100%',
    transition: 'width .25s ease, height .25s ease'
  },
  iframeWithBorder: {
    borderRadius: 20,
    borderColor: '#555',
  },
  iframeWithBorderLandscape: {
    borderWidth: '10px 50px'
  },
  iframeWithBorderPortrait: {
    borderWidth: '50px 10px'
  },
  hostContainer: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f3f3',
    height: '100%',
    maxHeight: 'calc(100% - 64px)',
    overflow: 'auto',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  }
}));

interface AudiencesPanelProps {

}

export function AudiencesPanelUI(props: AudiencesPanelProps) {

  const classes = useStyles({});

  const {
  } = props;

  return (
    <ToolPanel title={translations.audiencesPanel}>
      <Typography component="h2" variant="subtitle1" style={{ padding: '10px' }}>
        <FormattedMessage
          id="craftercms.ice.audiences.audiencesPanel"
          defaultMessage={`Audiences Panel`}
        />
      </Typography>
    </ToolPanel>
  );

}

export default function AudiencesPanel() {

  const classes = useStyles({});

  return (
    <div>
      <AudiencesPanelUI
      />
    </div>
  );

}
