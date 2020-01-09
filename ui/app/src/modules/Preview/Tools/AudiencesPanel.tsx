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
import React from 'react';
import ToolPanel from './ToolPanel';
import { defineMessages, FormattedMessage } from 'react-intl';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
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
import Button from '@material-ui/core/Button';
import DateTimePicker from "../../../components/DateTimePicker";
import { useSelection, useStateResource } from "../../../utils/hooks";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import LoadingState from "../../../components/SystemStatus/LoadingState";
import { useDispatch } from "react-redux";
import { updateAudiencesPanelProfile } from "../../../state/actions/preview";
import { ContentTypeField } from "../../../models/ContentType";
import { nnou, nou, reversePluckProps } from "../../../utils/object";
import GlobalState from "../../../models/GlobalState";
import ContentInstance from "../../../models/ContentInstance";
import { get } from "../../../utils/ajax";

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
  profile: ContentInstance;
  profileApplying: boolean;
  profileApplied: boolean;
  onFormChange: Function;
  saveProfile: Function;
  setDefaults: Function;
}

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {

  const classes = useStyles({});
  const {
    audiencesResource,
    profile,
    profileApplying,
    profileApplied,
    onFormChange,
    saveProfile,
    setDefaults
  } = props;
  const config = audiencesResource.read();

  return (
    <ToolPanel title={translations.audiencesPanel}>
      {
        <>
          <Grid className={classes.PanelMargin}>
            {
              Object.keys(config.fields).map((field: any) => (
                <React.Fragment key={field}>
                  <AudiencesFormSection
                    property={config.fields[field]}
                    profileValue={profile[field] ? profile[field].key : undefined}
                    profileTimezone={profile[`${field}_tz`] ? profile[`${field}_tz`].key : undefined}
                    onFormChange={onFormChange}
                  />
                  <Divider className={classes.divider}/>
                </React.Fragment>
              ))
            }
          </Grid>
          <Grid className={classes.actionBTN}>
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
      }
    </ToolPanel>
  );
}

export default function AudiencesPanel() {
  const state = useSelection<GlobalState['preview']['audiencesPanel']>(state => state.preview.audiencesPanel);
  const resource = useStateResource(
    state,
    {
      shouldRenew: (source, resource) => resource.complete && nou(source.contentType),
      shouldResolve: source => (!source.isFetching) && nnou(source.contentType) && nnou(source.model),
      shouldReject: source => nnou(source.error),
      errorSelector: source => source.error,
      resultSelector: source => source.contentType
    }
  );

  const dispatch = useDispatch();

  const onFormChange = (name: string, value: string) => {
    dispatch(updateAudiencesPanelProfile(name, value));
  };


  // TODO: Update to new state structure
  const saveProfile = () => {
    const model = reversePluckProps(state.model, 'craftercms');
    const params = encodeURI(Object.entries(model).map(([key, val]) => `${key}=${val.key}`).join('&'));

    get(`/api/1/profile/set?${params}`).subscribe(
      ({ response }) => {
        // TODO: display success message
      }
    );
  };

  const setDefaults = (config) => {
    Object.keys(config.fields).forEach((property: any) => {
      dispatch(updateAudiencesPanelProfile(property, config.fields[property].defaultValue));
    });
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
            profile={state.model}
            profileApplying={state.isApplying}
            profileApplied={state.applied}
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
  property: any;
  profileValue: any;
  profileTimezone?: string;
  onFormChange: Function;
}

function AudiencesFormSection(props: AudiencesFormProps) {

  const classes = useStyles({});
  const {
    property,
    profileValue,
    profileTimezone,
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
    timezone && onFormChange(`${name}_tz`, encodeURIComponent(timezone));
  };

  switch (property.type) {
    case "dropdown":
      return (
        <AudiencesControl property={property}>
          <Select
            labelId={property.id}
            id={property.id}
            value={profileValue}
            onChange={handleSelectChange(property.id)}
          >
            {
              property.values ? (
                property.values.map((possibleValue: any, index: number) => (
                  <MenuItem value={possibleValue.value} key={index}>{possibleValue.value}</MenuItem>
                ))
              ) : (null)
            }
          </Select>
          <FormHelperText>{property.helpText}</FormHelperText>
        </AudiencesControl>
      );
    case "checkbox-group":
      const valuesArray = nnou(profileValue) ? profileValue.split(',') : [];

      return (
        <AudiencesControl property={property}>
          <>
            {
              property.values ? (
                property.values.map((possibleValue: any, index: number) => (
                  <FormControlLabel
                    key={index}
                    htmlFor={property.id}
                    control={
                      <Checkbox
                        color="primary"
                        checked={valuesArray.includes(possibleValue.value)}
                        onChange={handleInputChange(property.id, possibleValue.value, valuesArray)}
                      />
                    }
                    label={possibleValue.value}/>
                ))
              ) : (null)
            }
            <FormHelperText>{property.helpText}</FormHelperText>
          </>
        </AudiencesControl>
      );
    case "date-time":
      return (
        <AudiencesControl property={property}>
          <>
            <DateTimePicker
              initialDate={profileValue}
              timezone={profileTimezone}
              onChange={dateTimePickerChange(property.id)}/>
            <FormHelperText>{property.helpText}</FormHelperText>
          </>
        </AudiencesControl>
      );
    default:
      return (
        <AudiencesControl property={property}>
          <TextField
            id={property.id}
            type="text"
            name="input"
            placeholder="auto"
            fullWidth
            value={profileValue}
            helperText={property.helpText}
            onChange={handleInputChange(property.id)}
          />
        </AudiencesControl>
      );
  }
}

interface AudiencesControlProps {
  property: ContentTypeField;
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
          htmlFor={property.id}
        >
          {property.name}
        </InputLabel>
        {children}
      </FormControl>
    </Grid>
  )
}
