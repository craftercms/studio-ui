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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
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
import { setAudiencesPanelModel, updateAudiencesPanelModel } from "../../../state/actions/preview";
import { ContentTypeField } from "../../../models/ContentType";
import { nnou, nou, reversePluckProps } from "../../../utils/object";
import GlobalState from "../../../models/GlobalState";
import ContentInstance from "../../../models/ContentInstance";

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
  },
  audiencesPanelLoading: {
    id: 'craftercms.ice.audiences.loading',
    defaultMessage: 'Retrieving targeting options'
  }
});

interface AudiencesPanelUIProps {
  audiencesResource: any;
  model: ContentInstance;
  modelApplying: boolean;
  modelApplied: boolean;
  onFormChange: Function;
  saveModel: Function;
  setDefaults: Function;
}

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {

  const classes = useStyles({});
  const {
    audiencesResource,
    model,
    modelApplying,
    modelApplied,
    onFormChange,
    saveModel,
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
                    modelApplying={modelApplying}
                    modelValue={model[field] ? model[field].key : undefined}
                    modelTimezone={model[`${field}_tz`] ? model[`${field}_tz`].key : undefined}
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
            <Button variant="contained" color="primary" onClick={() => saveModel()}>
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

  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const onFormChange = (name: string, value: string) => {
    dispatch(updateAudiencesPanelModel({
      [name]: {
        key: value,
        label: value
      }
    }));
  };

  const saveModel = () => {
    const model = reversePluckProps(state.model, 'craftercms');
    const params = encodeURI(Object.entries(model).map(([key, val]) => `${key}=${val.key}`).join('&'));

    dispatch(setAudiencesPanelModel(params));
  };

  const setDefaults = (config) => {
    const props = {};

    Object.keys(config.fields).forEach((property: any) => {
      const propValue = config.fields[property].defaultValue;
      props[property] = {
        key: propValue,
        label: propValue
      };
    });

    dispatch(updateAudiencesPanelModel(props));
  };

  return (
    <ErrorBoundary>
      <React.Suspense
        fallback={
          <LoadingState
            title={formatMessage(translations.audiencesPanelLoading)}
            graphicProps={{ width: 150 }}
          />
        }
      >
        <AudiencesPanelUI
          audiencesResource={resource}
          model={state.model}
          modelApplying={state.isApplying}
          modelApplied={state.applied}
          onFormChange={onFormChange}
          saveModel={saveModel}
          setDefaults={setDefaults}
        />
      </React.Suspense>
    </ErrorBoundary>
  );

}

interface AudiencesFormProps {
  property: any;
  modelValue: any;
  modelApplying: boolean;
  modelTimezone?: string;
  onFormChange: Function;
}

function AudiencesFormSection(props: AudiencesFormProps) {

  const classes = useStyles({});
  const {
    property,
    modelValue,
    modelApplying,
    modelTimezone,
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
            value={modelValue}
            onChange={handleSelectChange(property.id)}
            disabled={modelApplying}
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
      const valuesArray = nnou(modelValue) ? modelValue.split(',') : [];

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
                        disabled={modelApplying}
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
              initialDate={modelValue}
              timezone={modelTimezone}
              onChange={dateTimePickerChange(property.id)}
              disabled={modelApplying}/>
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
            value={modelValue}
            helperText={property.helpText}
            onChange={handleInputChange(property.id)}
            disabled={modelApplying}
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
