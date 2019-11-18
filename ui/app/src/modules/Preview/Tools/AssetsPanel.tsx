import React from 'react';
import Typography from '@material-ui/core/Typography';
import { defineMessages } from 'react-intl';
import ToolPanel from './ToolPanel';

const translations = defineMessages({
  assetsPanel: {
    id: 'craftercms.ice.assets.title',
    defaultMessage: 'Assets'
  }
});

export default function AssetsPanel() {
  return (
    <ToolPanel title={translations.assetsPanel}>
      <Typography component="h2" variant="subtitle1" style={{ padding: '10px' }}>
        Assets Panel
      </Typography>
    </ToolPanel>
  );
}
