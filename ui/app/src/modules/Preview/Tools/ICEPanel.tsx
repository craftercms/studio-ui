import React from 'react';
import ToolPanel from './ToolPanel';
import { defineMessages } from 'react-intl';
import Typography from '@material-ui/core/Typography';

const translations = defineMessages({
  inContextEditing: {
    id: 'craftercms.ice.ice.title',
    defaultMessage: 'In Context Editing'
  }
});

export default function ICEPanel() {
  return (
    <ToolPanel title={translations.inContextEditing}>
      <Typography component="h2" variant="subtitle1" style={{ padding: '10px' }}>
        ICE Panel
      </Typography>
    </ToolPanel>
  );
}
