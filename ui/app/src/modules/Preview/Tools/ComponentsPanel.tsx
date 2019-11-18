import React from 'react';
import Typography from '@material-ui/core/Typography';
import ToolPanel from './ToolPanel';
import { defineMessages } from 'react-intl';

const translations = defineMessages({
  componentsPanel: {
    id: 'craftercms.ice.components.title',
    defaultMessage: 'Components'
  }
});

export default function ComponentsPanel() {
  return (
    <ToolPanel title={translations.componentsPanel}>
      <Typography component="h2" variant="subtitle1" style={{ padding: '10px' }}>
        Components Panel
      </Typography>
    </ToolPanel>
  );
}
