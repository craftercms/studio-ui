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

import React, { PropsWithChildren } from 'react';
import ToolPanel from './ToolPanel';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Button from '@material-ui/core/Button';
import { useSelection, useStateResource } from '../../../utils/hooks';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import LoadingState from '../../../components/SystemStatus/LoadingState';
import { useDispatch } from 'react-redux';
import { setActiveModel, updateAudiencesPanelModel } from '../../../state/actions/preview';
import { ContentTypeField } from '../../../models/ContentType';
import { nnou, nou, reversePluckProps } from '../../../utils/object';
import GlobalState from '../../../models/GlobalState';
import ContentInstance from '../../../models/ContentInstance';
import Input from './AudiencesPanelControls/Input';
import Dropdown from './AudiencesPanelControls/Dropdown';
import CheckboxGroup from './AudiencesPanelControls/CheckboxGroup';
import DateTime from './AudiencesPanelControls/DateTime';

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

const controlsMap = {
  'dropdown': Dropdown,
  'checkbox-group': CheckboxGroup,
  'date-time': DateTime,
  'input': Input
};

export interface Control {
  field: any;
  value: string;
  timezone?: string;
  onChange: Function;
  disabled: boolean;
}

interface AudiencesPanelUIProps {
  audiencesResource: any;
  model: ContentInstance;
  modelApplying: boolean;
  modelApplied: boolean;
  onFormChange: Function;
  onSaveModel: Function;
  onSetDefaults: Function;
}

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {

  const classes = useStyles({});
  const {
    audiencesResource,
    model,
    modelApplying,
    onFormChange,
    onSaveModel,
    onSetDefaults
  } = props;
  const contentType = audiencesResource.read();

  return (
    <ToolPanel title={translations.audiencesPanel}>
      {
        <>
          <Grid className={classes.PanelMargin}>
            {
              Object.keys(contentType.fields).map((field: any) => {
                const type = contentType.fields[field].type;
                const Control = controlsMap[type];

                const controlProps = {
                  field: contentType.fields[field],
                  value: model[field] ? model[field].key : undefined,
                  onChange: onFormChange,
                  disabled: modelApplying
                };

                if (model[`${field}_tz`]) {
                  // contentType.fields[field].timezone = model[`${field}_tz`];
                  controlProps['timezone'] = model[`${field}_tz`].key;
                }

                return (
                  <AudiencesFormSection field={contentType.fields[field]} key={field} showDivider={true}>
                    <Control
                      {...controlProps}
                    />
                  </AudiencesFormSection>
                )
              })
            }
          </Grid>
          <Grid className={classes.actionBTN}>
            <Button variant="contained" onClick={() => onSetDefaults(contentType)}>
              <FormattedMessage
                id="audiencesPanel.defaults"
                defaultMessage={`Defaults`}
              />
            </Button>
            <Button variant="contained" color="primary" onClick={() => onSaveModel()}>
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

    dispatch(setActiveModel(params));
  };

  const setDefaults = (contentType) => {
    const props = {};

    Object.keys(contentType.fields).forEach((fieldId: string) => {
      const propValue = contentType.fields[fieldId].defaultValue;
      props[fieldId] = {
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
          onSaveModel={saveModel}
          onSetDefaults={setDefaults}
        />
      </React.Suspense>
    </ErrorBoundary>
  );

}

type AudiencesFormSectionProps = PropsWithChildren<{
  field: ContentTypeField;
  showDivider: boolean;
}>

function AudiencesFormSection(props: AudiencesFormSectionProps) {
  const classes = useStyles({});

  const { field, children } = props;

  return (
    <>
      <Grid item xs={12}>
        <FormControl className={classes.formControl}>
          <InputLabel
            className={classes.InputLabel}
            focused={true}
            htmlFor={field.id}
          >
            {field.name}
          </InputLabel>
          {children}
        </FormControl>
        <FormHelperText>{field.helpText}</FormHelperText>
      </Grid>
      <Divider className={classes.divider}/>
    </>
  )
}
