/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { PropsWithChildren, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import FormHelperText from '@material-ui/core/FormHelperText';
import Button from '@material-ui/core/Button';
import { useActiveSiteId, useSelection } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import {
  fetchAudiencesPanelModel,
  setActiveTargetingModel,
  updateAudiencesPanelModel
} from '../../state/actions/preview';
import { ContentTypeField } from '../../models/ContentType';
import GlobalState from '../../models/GlobalState';
import ContentInstance from '../../models/ContentInstance';
import Input from '../Controls/FormEngine/Input';
import Dropdown from '../Controls/FormEngine/Dropdown';
import CheckboxGroup from '../Controls/FormEngine/CheckboxGroup';
import DateTime from '../Controls/FormEngine/DateTime';
import LookupTable from '../../models/LookupTable';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      margin: theme.spacing(1)
    },
    formControl: {
      width: '100%',
      '& .MuiFormGroup-root': {
        marginLeft: '10px'
      },
      '& .MuiInputBase-root': {
        marginTop: '12px !important'
      }
    },
    panelMargin: {
      margin: `${theme.spacing(1)}px`
    },
    textField: {
      width: '100%'
    },
    actionButton: {
      margin: '18px 0 80px 15px',
      '& .MuiButton-contained': {
        marginRight: '8px'
      }
    },
    divider: {
      margin: '23px 0 10px'
    }
  })
);

const translations = defineMessages({
  audiencesPanel: {
    id: 'previewAudiencesPanel.title',
    defaultMessage: 'Audience Targeting'
  },
  audiencesPanelLoading: {
    id: 'previewAudiencesPanel.loading',
    defaultMessage: 'Retrieving targeting options'
  }
});

const controlsMap = {
  dropdown: Dropdown,
  'checkbox-group': CheckboxGroup,
  'date-time': DateTime,
  input: Input
};

interface AudiencesPanelUIProps {
  model: ContentInstance;
  fields: LookupTable<ContentTypeField>;
  modelApplying: boolean;
  modelApplied: boolean;
  onChange: Function;
  onSaveModel: Function;
}

const getDefaultModel = (fields: LookupTable<ContentTypeField>) => {
  const props = {};

  Object.keys(fields).forEach((fieldId: string) => {
    const propValue = fields[fieldId].defaultValue;
    props[fieldId] = propValue;
  });

  return props;
};

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {
  const classes = useStyles({});
  const { model, modelApplying, onChange, onSaveModel, fields } = props;

  const onFieldChange = (fieldId: string, type: string) => (value: any) => {
    let props;

    if (type === 'date-time') {
      const timezone = value.tz();
      value = value.toISOString();

      props = {
        ...model,
        [fieldId]: value,
        [`${fieldId}_tz`]: timezone
      };
    } else {
      props = {
        ...model,
        [fieldId]: value
      };
    }

    onChange(props);
  };

  return (
    <>
      {
        <>
          <Grid className={classes.panelMargin}>
            {Object.keys(fields).map((fieldId: string) => {
              const type = fields[fieldId].type;
              const Control = controlsMap[type];

              const controlProps = {
                field: fields[fieldId],
                value: model[fieldId] ?? undefined,
                onChange: onFieldChange(fieldId, type),
                disabled: modelApplying
              };

              if (controlProps.field.type === 'date-time' && model[`${fieldId}_tz`]) {
                controlProps['timezone'] = model[`${fieldId}_tz`];
              }

              return (
                <AudiencesFormSection field={fields[fieldId]} key={fieldId} showDivider>
                  <Control {...controlProps} />
                </AudiencesFormSection>
              );
            })}
          </Grid>
          <Grid className={classes.actionButton}>
            <Button variant="contained" onClick={() => onChange(getDefaultModel(fields))}>
              <FormattedMessage id="audiencesPanel.defaults" defaultMessage={`Defaults`} />
            </Button>
            <Button variant="contained" color="primary" onClick={() => onSaveModel()}>
              <FormattedMessage id="audiencesPanel.apply" defaultMessage={`Apply`} />
            </Button>
          </Grid>
        </>
      }
    </>
  );
}

export default function PreviewAudiencesPanel(props) {
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const { fields } = props;
  const panelState = useSelection<GlobalState['preview']['audiencesPanel']>((state) => state.preview.audiencesPanel);

  useEffect(() => {
    if (site && panelState.isFetching === null) {
      dispatch(fetchAudiencesPanelModel({ fields }));
    }
  }, [site, panelState, dispatch, fields]);

  const onChange = (model: ContentInstance) => {
    dispatch(updateAudiencesPanelModel(model));
  };

  const saveModel = () => {
    dispatch(setActiveTargetingModel());
  };

  return (
    <ConditionalLoadingState
      isLoading={panelState.isApplying || panelState.isFetching === null || panelState.isFetching !== false}
    >
      <AudiencesPanelUI
        model={panelState.model}
        fields={fields}
        modelApplying={panelState.isApplying}
        modelApplied={panelState.applied}
        onChange={onChange}
        onSaveModel={saveModel}
      />
    </ConditionalLoadingState>
  );
}

type AudiencesFormSectionProps = PropsWithChildren<{
  field: ContentTypeField;
  showDivider?: boolean;
}>;

function AudiencesFormSection(props: AudiencesFormSectionProps) {
  const classes = useStyles({});
  const { field, showDivider, children } = props;

  return (
    <>
      <Grid item xs={12}>
        {children}
        <FormHelperText>{field.helpText}</FormHelperText>
      </Grid>
      {showDivider && <Divider className={classes.divider} />}
    </>
  );
}
