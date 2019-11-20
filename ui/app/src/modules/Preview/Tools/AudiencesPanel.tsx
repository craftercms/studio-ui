import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import ToolPanel from './ToolPanel';
import { defineMessages, FormattedMessage } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { get } from '../../../utils/ajax';


const translations = defineMessages({
  audiencesPanel: {
    id: 'craftercms.ice.audiences.title',
    defaultMessage: 'Audience Targeting'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  
}));

interface AudiencesPanelUIProps{
  properties : any;
}

interface AudiencesPanelProps {
  siteId: string;
}

interface ResultObject {
  properties: []
}

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {

  const classes = useStyles({});
  const {
    properties
  } = props;

  return (
    <ToolPanel title={translations.audiencesPanel}>
        <Typography component="h2" variant="subtitle1" style={{ padding: '10px' }}>
          <FormattedMessage
            id="craftercms.ice.audiences.audiencesPanel"
            defaultMessage={`Audiences Panel`}
          />
        </Typography>
        <Typography component="p" style={{ padding: '10px' }}>
          {properties[0].hint}
        </Typography>
    </ToolPanel>
  );
}

export default function AudiencesPanel(props: AudiencesPanelProps) {

  const classes = useStyles({});
  const [items, setItems] = useState();
  const {
    siteId
  } = props;

  function getConfigurationFile() {
    get(`/studio/api/1/services/api/1/site/get-configuration.json?site=editorial&path=/targeting/targeting-config.xml`)
      .subscribe(
        (response: any) => {
          setItems(
            response.response.property
          );
        },
        () => {
          setItems(
            []
          );
        }
      );
  }

  getConfigurationFile();

  return (
    <div>
      <AudiencesPanelUI
        properties = {items}
      />
    </div>
  );

}
