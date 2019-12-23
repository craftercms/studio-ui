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
import { getAudiencesPanelConfig, AudiencesPanelDescriptor, AudiencesPanelConfig } from '../../../services/configuration';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
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
import InfoIcon from '@material-ui/icons/Info';
import Button from '@material-ui/core/Button';
import { get } from '../../../utils/ajax';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      margin: theme.spacing(1),
    },
    formControl: {
      width: '100%',
      '& .MuiFormGroup-root': {
        marginLeft: '10px',
      },
      '& .MuiInputBase-root': {
        marginTop: '12px !important',
      }
    },
    IconButton: {
      padding: '6px',
      marginLeft: '5px'
    },
    InputLabel: {
      position: 'relative'
    },
    PanelMargin: {
      margin: '0 15px',
    },
    textField: {
      width: '100%',
    },
    actionBTN:{
      margin:'18px 0 80px 15px',
      '& .MuiButton-contained':{
        marginRight: '8px',
      }
    },
    divider: {
      margin: '23px 0 10px',
    }
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
  profile: any;
}

interface AudiencesFormProps {
  properties: AudiencesPanelDescriptor;
  profile: string;
}

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {

  const classes = useStyles({});
  const {
    properties,
    profile
  } = props;

  return (
    <ToolPanel title={translations.audiencesPanel}>
      {
        properties ? (
          <>
            <Grid className={classes.PanelMargin}>
              {
                properties.map((property: any) => (
                  <>
                    <GetCodeDependingType
                      properties={property}
                      profile={profile[property.name] ? profile[property.name]: null}
                    />
                    <Divider className={classes.divider} />
                  </>
                ))
              }
            </Grid>
            <Grid className={classes.actionBTN} >
              <Button variant="contained">
                <FormattedMessage
                  id="audiencesPanel.Defaults"
                  defaultMessage={'Defaults'}
                />
            </Button>
              <Button variant="contained" color="primary" >
                <FormattedMessage
                  id="audiencesPanel.Apply"
                  defaultMessage={'Apply'}
                />
            </Button>
            </Grid>
          </>
        ) : (null)
      }
    </ToolPanel>
  );
}

export default function AudiencesPanel() {

  const [configItems, setConfigItems] = useState();
  const [currentItems, setCurrentItems] = useState();
  const site = 'editorial';

  useEffect(() => {

    forkJoin(
      getAudiencesPanelConfig(site),
      get(`/api/1/profile/get`).pipe(map(response => response.response))
    ).subscribe(
        // Here code that needs both files
        ([config, profile]) => {
          setConfigItems(
            config.properties
          );
          setCurrentItems(
            profile.response
          );
        },
        () => {
          setConfigItems(
            []
          );
          setCurrentItems(
            []
          );
        }
      );
  }, []);

  return (
    <div>
      {
        setConfigItems && currentItems &&
        <AudiencesPanelUI
          properties={setConfigItems}
          profile={setCurrentItems}
        />
      }
    </div>
  );

}

function GetCodeDependingType(props: AudiencesFormProps) {

  const classes = useStyles({});
  const {
    properties,
    profile
  } = props;

  switch (properties.type) {
    case "dropdown":
      return (
        <Grid item xs={12}>
          <FormControl className={classes.formControl} >
            <InputLabel
              className={classes.InputLabel}
              focused={true}
              htmlFor={properties.name}
            >
              {properties.label}
              <Tooltip title={properties.hint} placement="top" >
                <IconButton aria-label={properties.hint} className={classes.IconButton}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </InputLabel>
            <Select
              labelId={properties.name}
              id={properties.name}
              defaultValue={profile ? profile : properties.default_value}
            >
              {
                properties.possible_values ? (
                  properties.possible_values.map((possible_value: any) => (
                    <MenuItem value={possible_value.value}>{possible_value.value}</MenuItem>
                  ))
                ) : (null)
              }
            </Select>
            <FormHelperText>{properties.description}</FormHelperText>
          </FormControl>
        </Grid>
      )
    case "checkboxes":
      return (
        <Grid item xs={12}>
          <FormControl className={classes.formControl} >
            <InputLabel
              className={classes.InputLabel}
              focused={true}
              htmlFor={properties.name}
            >
              {properties.label}
              <Tooltip title={properties.hint} placement="top" >
                <IconButton aria-label={properties.hint} className={classes.IconButton}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </InputLabel>
            {
              properties.possible_values ? (
                properties.possible_values.map((possible_value: any) => (
                  <FormControlLabel
                    htmlFor={properties.name}
                    control={
                      <Checkbox
                        color="primary"
                      />
                    }
                    label={possible_value.value} />
                ))
              ) : (null)
            }
            <FormHelperText>{properties.description}</FormHelperText>
          </FormControl>
        </Grid>
      )
    case "datetime":
      return (
        <Grid item xs={12}>
          <FormControl className={classes.formControl} >
            <InputLabel
              className={classes.InputLabel}
              focused={true}
              htmlFor={properties.name}
            >
              {properties.label}
              <Tooltip title={properties.hint} placement="top" >
                <IconButton aria-label={properties.hint} className={classes.IconButton}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </InputLabel>
            <TextField
              id={properties.name}
              type="text"
              name="input"
              placeholder="auto"
              fullWidth
              helperText={properties.description}
            />
          </FormControl>
        </Grid>
      )
    default:
      return (
        <Grid item xs={12}>
          <FormControl className={classes.formControl} >
            <InputLabel
              className={classes.InputLabel}
              focused={true}
              htmlFor={properties.name}
            >
              {properties.label}
              <Tooltip title={properties.hint} placement="top" >
                <IconButton aria-label={properties.hint} className={classes.IconButton}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </InputLabel>
            <TextField
              id={properties.name}
              type="text"
              name="input"
              placeholder="auto"
              fullWidth
              helperText={properties.description}
            />
          </FormControl>
        </Grid>
      )
  }
}
