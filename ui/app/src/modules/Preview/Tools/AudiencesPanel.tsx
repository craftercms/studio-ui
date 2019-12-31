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
import React, { useEffect, useState } from 'react';
import ToolPanel from './ToolPanel';
import { defineMessages, FormattedMessage } from 'react-intl';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AudiencesPanelDescriptor } from '../../../services/configuration';
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
import DateTimePicker from "../../../components/DateTimePicker";
import { useActiveSiteId, useEntitySelectionResource } from "../../../utils/hooks";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import LoadingState from "../../../components/SystemStatus/LoadingState";
import { useDispatch } from "react-redux";
import { setAudiencesPanelProfile } from "../../../state/actions/preview";

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
    ActionButton: {
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
  audiencesResource: any;
  currentProfile: any;
  setCurrentProfile: Function;
  onFormChange: Function;
  saveProfile: Function;
  setDefaults: Function;
}

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {

  const classes = useStyles({});
  const {
    audiencesResource,
    currentProfile,
    setCurrentProfile,
    onFormChange,
    saveProfile,
    setDefaults
  } = props;
  const site = useActiveSiteId();
  const audiencesData = audiencesResource.read();
  const audiencesSiteData = audiencesData.find(data => data.site === site).data;
  const { config, profile } = audiencesSiteData;

  useEffect(() => {
    let mergedProfile = {};

    config.forEach((property) => {
      mergedProfile[property.name] = profile[property.name] ?? property.defaultValue;
    });

    setCurrentProfile(
      mergedProfile
    );
  }, [config, profile]);

  return (
    <ToolPanel title={translations.audiencesPanel}>
      {
        currentProfile ? (
          <>
            <Grid className={classes.PanelMargin}>
              {
                config.map((property: any, index: number) => (
                  <div key={index}>
                    <AudiencesFormSection
                      property={property}
                      profile={currentProfile}
                      onFormChange={onFormChange}
                    />
                    <Divider className={classes.divider}/>
                  </div>
                ))
              }
            </Grid>
            <Grid className={classes.actionBTN} >
              <Button variant="contained" onClick={() => setDefaults(config)}>
                <FormattedMessage
                  id="audiencesPanel.defaults"
                  defaultMessage={`Defaults`}
                />
              </Button>
              <Button variant="contained" color="primary" onClick={() => saveProfile()}>
                <FormattedMessage
                  id="audiencesPanel.apply"
                  defaultMessage={`Apply`}
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
  const [currentProfile, setCurrentProfile] = useState();
  const resource = useEntitySelectionResource(state => state.preview.audiencesPanel);
  const site = useActiveSiteId();
  const dispatch = useDispatch();

  const onFormChange = (name: string, value: string) => {
    setCurrentProfile({ ...currentProfile, [name]: value });
  };

  const saveProfile = () => {
    let params = encodeURI(Object.entries(currentProfile).map(([key, val]) => `${key}=${val}`).join('&'));

    get(`/api/1/profile/set?${params}`).subscribe(
      ({ response }) => {
        dispatch(setAudiencesPanelProfile(site, currentProfile));
        // TODO: display success message
      }
    );
  };

  const setDefaults = (config) => {
    let defaultProfile = {};

    config.forEach((property) => {
      defaultProfile[property.name] = property.defaultValue;
    });

    setCurrentProfile(defaultProfile);
  };

  return (
    <div>
      <ErrorBoundary>
        <React.Suspense
          fallback={
            <LoadingState
              title="Loading"
              graphicProps={{ width: 150 }}
            />
          }
        >
          <AudiencesPanelUI
            audiencesResource={resource}
            currentProfile={currentProfile}
            setCurrentProfile={setCurrentProfile}
            onFormChange={onFormChange}
            saveProfile={saveProfile}
            setDefaults={setDefaults}
          />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );

}

interface AudiencesFormProps {
  property: AudiencesPanelDescriptor;
  profile: any;
  onFormChange: Function;
}

function AudiencesFormSection(props: AudiencesFormProps) {

  const classes = useStyles({});
  const {
    property,
    profile,
    onFormChange
  } = props;

  const handleSelectChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    onFormChange(name, event.target.value);
  };

  const handleInputChange = (name: string, label?: string, values?: string[]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();

    if(e.target.type === 'text') {
      onFormChange(name, e.target.value);
    } else if (e.target.type === 'checkbox') {
      if (e.target.checked) {
        if (!(label in values)) {
          values.push(label);
        }
      } else {
        values.splice( values.indexOf(label), 1);
      }
      onFormChange(name, values.join(','));
    }
  };

  const dateTimePickerChange = (name: string) => (scheduledDateTime: any) => {
    const datetime = scheduledDateTime.toISOString();
    const timezone = scheduledDateTime.tz();

    onFormChange(name, datetime);
    onFormChange(`${name}_tz`, encodeURIComponent(timezone));
  };

  switch (property.type) {
    case "dropdown":
      return (
        <AudiencesControl property={property}>
          <Select
            labelId={property.name}
            id={property.name}
            value={profile[property.name] ?? property.defaultValue}
            onChange={handleSelectChange(property.name)}
          >
            {
              property.possibleValues ? (
                property.possibleValues.map((possibleValue: any, index: number) => (
                  <MenuItem value={possibleValue.value} key={index}>{possibleValue.value}</MenuItem>
                ))
              ) : (null)
            }
          </Select>
          <FormHelperText>{property.description}</FormHelperText>
        </AudiencesControl>
      );
    case "checkboxes":
      const values = profile[property.name] ?? property.defaultValue,
        valuesArray = values.split(',');

      return (
        <AudiencesControl property={property}>
          <>
            {
              property.possibleValues ? (
                property.possibleValues.map((possibleValue: any, index: number) => (
                  <FormControlLabel
                    key={index}
                    htmlFor={property.name}
                    control={
                      <Checkbox
                        color="primary"
                        checked={valuesArray.includes(possibleValue.value)}
                        onChange={handleInputChange(property.name, possibleValue.value, valuesArray)}
                      />
                    }
                    label={possibleValue.value}/>
                ))
              ) : (null)
            }
            <FormHelperText>{property.description}</FormHelperText>
          </>
        </AudiencesControl>
      )
    case "datetime":
      return (
        <AudiencesControl property={property}>
          <>
            <DateTimePicker
              initialDate={profile[property.name] ?? property.defaultValue}
              timezone={profile[`${property.name}_tz`] ?? undefined}
              onChange={dateTimePickerChange(property.name)}/>
            <FormHelperText>{property.description}</FormHelperText>
          </>
        </AudiencesControl>
      )
    default:
      return (
        <AudiencesControl property={property}>
          <TextField
            id={property.name}
            type="text"
            name="input"
            placeholder="auto"
            fullWidth
            value={profile[property.name] ?? property.defaultValue}
            helperText={property.description}
            onChange={handleInputChange(property.name)}
          />
        </AudiencesControl>
      )
  }
}

interface AudiencesControlProps {
  property: AudiencesPanelDescriptor;
  children: any;
}

function AudiencesControl(props: AudiencesControlProps) {
  const classes = useStyles({});

  const { property, children } = props;

  return (
    <Grid item xs={12}>
      <FormControl className={classes.formControl}>
        <InputLabel
          className={classes.InputLabel}
          focused={true}
          htmlFor={property.name}
        >
          {property.label}
          <Tooltip title={property.hint} placement="top">
            <IconButton aria-label={property.hint} className={classes.ActionButton}>
              <InfoIcon/>
            </IconButton>
          </Tooltip>
        </InputLabel>
        {children}
      </FormControl>
    </Grid>
  )
}
