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
import { getAudiencesPanelConfig } from '../../../services/configuration';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';


const translations = defineMessages({
  audiencesPanel: {
    id: 'craftercms.ice.audiences.title',
    defaultMessage: 'Audience Targeting'
  }
});

const useStyles = makeStyles((theme) => createStyles({

}));

interface AudiencesPanelUIProps {
  properties: any;
}

interface AudiencesPanelProps {
  siteId: string;
}

interface ResultObject {
  properties: []
}

interface CodeDependingTypeProps {
  type: string;
}

function getCodeDependingType(props: CodeDependingTypeProps) {

  const {
    type
  } = props;

  switch (type) {
    case "input":
      return (
        <FormControl component="fieldset">
          <FormLabel component="legend">input</FormLabel>
          <TextField
              id= "standard-basic"
              label= "input"
              type= "text"
              name= "input"
              margin= "normal"
              placeholder= "auto"
              onKeyUp= {}
              onChange= {}
              value= {}
            />
        </FormControl>
      )
    case "dropdown":
      return (
        <FormControl component="fieldset">
          <FormLabel component="legend">input</FormLabel>
          <TextField
              id= "standard-basic"
              label= "input"
              type= "text"
              name= "input"
              margin= "normal"
              placeholder= "auto"
              onKeyUp= {}
              onChange= {}
              value= {}
            />
        </FormControl>
      )
    case "checkboxes":
      return (
        <FormControl component="fieldset">
          <FormLabel component="legend">input</FormLabel>
          <TextField
              id= "standard-basic"
              label= "input"
              type= "text"
              name= "input"
              margin= "normal"
              placeholder= "auto"
              onKeyUp= {}
              onChange= {}
              value= {}
            />
        </FormControl>
      )
    case "dateTime":
      return (
        <FormControl component="fieldset">
          <FormLabel component="legend">input</FormLabel>
          <TextField
              id= "standard-basic"
              label= "input"
              type= "text"
              name= "input"
              margin= "normal"
              placeholder= "auto"
              onKeyUp= {}
              onChange= {}
              value= {}
            />
        </FormControl>
      )
  }
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
      {
        properties ? (
          properties.map((property: any) => (
            property.name === "input" ? (
              <div>
                {property.name}
              </div>
            ) : (null)
          ))
        ) : (null)
      }
    </ToolPanel>
  );
}

export default function AudiencesPanel() {

  const classes = useStyles({});
  const [items, setItems] = useState();
  const site = 'editorial';

  useEffect(() => {
    getAudiencesPanelConfig(site)
      .subscribe(
        (response: any) => {
          setItems(
            response.properties
          );
        },
        () => {
          setItems(
            []
          );
        }
      );
  }, []);

  return (
    <div>
      {
        items &&
        <AudiencesPanelUI
          properties={items}
        />
      }
    </div>
  );

}
