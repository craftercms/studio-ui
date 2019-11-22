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
import React, { useState, useEffect, useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import ToolPanel from './ToolPanel';
import { defineMessages, FormattedMessage } from 'react-intl';
import { createStyles, makeStyles, withStyles, Theme } from '@material-ui/core/styles';
import { get } from '../../../utils/ajax';
import { getAudiencesPanelConfig, AudiencesPanelDescriptor, AudiencesPanelConfig } from '../../../services/configuration';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import InfoIcon from '@material-ui/icons/Info';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      margin: theme.spacing(1),
    },
  }),
);

const translations = defineMessages({
  audiencesPanel: {
    id: 'craftercms.ice.audiences.title',
    defaultMessage: 'Audience Targeting'
  }
});

interface AudiencesPanelUIProps {
  properties: any;
}

interface AudiencesPanelProps {
  siteId: string;
}

interface AudiencesFormProps {
  properties: AudiencesPanelDescriptor;
}

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {

  const classes = useStyles({});
  const {
    properties
  } = props;

  return (
    <ToolPanel title={translations.audiencesPanel}>
      {
        properties ? (
          properties.map((property: any) => (
            <GetCodeDependingType
              properties={property}
            />
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

function GetCodeDependingType(props: AudiencesFormProps) {

  const classes = useStyles({});
  const {
    properties
  } = props;

  switch (properties.type) {
    case "dropdown":
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>

            {/* <FormControl variant="outlined">
              <InputLabel id="test-label">
                {properties.label}
              </InputLabel>
              <Select
                labelId={properties.label}
                id={properties.name}
                value={properties.name}
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
              <FormHelperText>{properties.description}</FormHelperText>
            </FormControl> */}

            <InputLabel>{properties.label}</InputLabel>
            <Tooltip title={properties.hint} placement="top" >
              <IconButton aria-label={properties.hint}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Select
              labelId={properties.label}
              id={properties.name}
              value={properties.name}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
            <FormHelperText>{properties.description}</FormHelperText>
          </Grid>
        </Grid>
      )
    case "checkboxes":
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InputLabel>{properties.label}</InputLabel>
            <Tooltip title={properties.hint} placement="top" >
              <IconButton aria-label={properties.hint}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <FormControlLabel
              control={
                <Checkbox
                  value={properties.name}
                  color="primary"
                />
              }
              label={properties.label} />
            <FormHelperText>{properties.description}</FormHelperText>
          </Grid>
        </Grid>
      )
    case "datetime":
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InputLabel>{properties.label}</InputLabel>
            <Tooltip title={properties.hint} placement="top" >
              <IconButton aria-label={properties.hint}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <TextField
              id={properties.name}
              type="text"
              name="input"
              margin="normal"
              placeholder="auto"
              helperText={properties.description}
            />
          </Grid>
        </Grid>
      )
    default:
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InputLabel>{properties.label}</InputLabel>
            <Tooltip title={properties.hint} placement="top" >
              <IconButton aria-label={properties.hint}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <TextField
              id={properties.name}
              type="text"
              name="input"
              margin="normal"
              placeholder="auto"
              helperText={properties.description}
            />
          </Grid>
        </Grid>
      )
  }
}
