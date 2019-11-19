import React from 'react';
import Typography from '@material-ui/core/Typography';
import ToolPanel from './ToolPanel';
import { defineMessages } from 'react-intl';

const translations = defineMessages({
  audiencesPanel: {
    id: 'craftercms.ice.audiences.title',
    defaultMessage: 'Audience Targeting'
  }
});

export default function AudiencesPanel() {
  return (
    <ToolPanel title={translations.audiencesPanel}>
      <Typography component="h2" variant="subtitle1" style={{ padding: '10px' }}>
        Audiences Panel
      </Typography>
    </ToolPanel>
  );
}
