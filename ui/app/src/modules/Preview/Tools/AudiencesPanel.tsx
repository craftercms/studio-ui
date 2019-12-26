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
import { AudiencesPanelDescriptor, getAudiencesPanelConfig } from '../../../services/configuration';
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
import DateTimePicker from "../../../components/DateTimePicker";
import { useActiveSiteId } from "../../../utils/hooks";

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
  config: any;
  profile: any;
  onFormChange: Function;
  saveProfile: Function;
  setDefaults: Function;
}

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {

  const classes = useStyles({});
  const {
    config,
    profile,
    onFormChange,
    saveProfile,
    setDefaults
  } = props;

  return (
    <ToolPanel title={translations.audiencesPanel}>
      {
        config ? (
          <>
            <Grid className={classes.PanelMargin}>
              {
                config.map((property: any, index: number) => (
                  <div key={index}>
                    <GetCodeDependingType
                      property={property}
                      profile={profile}
                      onFormChange={onFormChange}
                    />
                    <Divider className={classes.divider} />
                  </div>
                ))
              }
            </Grid>
            <Grid className={classes.actionBTN} >
              <Button variant="contained" onClick={() => setDefaults()}>
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

  const [config, setConfig] = useState();
  const [profile, setProfile] = useState();
  const site = useActiveSiteId();

  useEffect(() => {

    forkJoin([
      getAudiencesPanelConfig(site),
      get(`/api/1/profile/get`).pipe(map(response => response.response))
    ]).subscribe(
      // Here code that needs both files
      ([config, profile]) => {
        setConfig(
          config.properties
        );

        let mergedProfile = {};

        config.properties.forEach((property) => {
          mergedProfile[property.name] = profile[property.name] ?? property.default_value;
        });

        setProfile(
          mergedProfile
        );
      },
      () => {
        // TODO: handle error (will use PreviewConcierge)
      }
    );
  }, []);

  const onFormChange = (name: string, value: string) => {
    setProfile({ ...profile, [name]: value });
  };

  const saveProfile = () => {
    let params = encodeURI(Object.entries(profile).map(([key, val]) => `${key}=${val}`).join('&'));

    get(`/api/1/profile/set?${params}`).subscribe(
      ({ response }) => {
        // TODO: handle success
      },
      () => {
        // TODO: handle error
      }
    );
  };

  const setDefaults = () => {
    let defaultProfile = {};

    config.forEach((property) => {
      defaultProfile[property.name] = property.default_value;
    });

    setProfile(defaultProfile);
  };

  return (
    <div>
      {
        config && profile &&
        <AudiencesPanelUI
          config={config}
          profile={profile}
          onFormChange={onFormChange}
          saveProfile={saveProfile}
          setDefaults={setDefaults}
        />
      }
    </div>
  );

}

interface AudiencesFormProps {
  property: AudiencesPanelDescriptor;
  profile: any;
  onFormChange: Function;
}

function GetCodeDependingType(props: AudiencesFormProps) {

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
            value={profile[property.name] ?? property.default_value}
            onChange={handleSelectChange(property.name)}
          >
            {
              property.possible_values ? (
                property.possible_values.map((possible_value: any, index: number) => (
                  <MenuItem value={possible_value.value} key={index}>{possible_value.value}</MenuItem>
                ))
              ) : (null)
            }
          </Select>
          <FormHelperText>{property.description}</FormHelperText>
        </AudiencesControl>
      );
    case "checkboxes":
      const values = profile[property.name] ?? property.default_value,
        valuesArray = values.split(',');

      return (
        <AudiencesControl property={property}>
          <>
            {
              property.possible_values ? (
                property.possible_values.map((possible_value: any, index: number) => (
                  <FormControlLabel
                    key={index}
                    htmlFor={property.name}
                    control={
                      <Checkbox
                        color="primary"
                        checked={valuesArray.includes(possible_value.value)}
                        onChange={handleInputChange(property.name, possible_value.value, valuesArray)}
                      />
                    }
                    label={possible_value.value}/>
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
              initialDate={profile[property.name] ?? property.default_value}
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
            value={profile[property.name] ?? property.default_value}
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
