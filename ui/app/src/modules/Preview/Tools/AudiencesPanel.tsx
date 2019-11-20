/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
