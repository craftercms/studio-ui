/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import ContentInstance from '../../models/ContentInstance';
import Grid from '@material-ui/core/Grid';
import { AudiencesFormSection } from './AudiencesFormSection';
import SecondaryButton from '../SecondaryButton';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import PrimaryButton from '../PrimaryButton';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ContentTypeField } from '../../models/ContentType';
import Input from '../Controls/FormEngine/Input';
import Dropdown from '../Controls/FormEngine/Dropdown';
import CheckboxGroup from '../Controls/FormEngine/CheckboxGroup';
import DateTime from '../Controls/FormEngine/DateTime';
import LookupTable from '../../models/LookupTable';
import { Alert } from '@material-ui/lab';

interface AudiencesPanelUIProps {
  model: ContentInstance;
  fields: LookupTable<ContentTypeField>;
  modelApplying: boolean;
  modelApplied: boolean;
  onChange: Function;
  onSaveModel: Function;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    panelMargin: {
      margin: `${theme.spacing(1)}px`
    },
    actionButtons: {
      margin: '10px 0',
      textAlign: 'right',
      '& .MuiButton-root': {
        marginRight: theme.spacing(1)
      }
    }
  })
);

const controlsMap = {
  dropdown: Dropdown,
  'checkbox-group': CheckboxGroup,
  'date-time': DateTime,
  input: Input
};

const messages = defineMessages({
  controlNotFound: {
    id: 'audiencesPanel.undefinedControlType',
    defaultMessage: 'Unknown control type'
  }
});

const getDefaultModel = (fields: LookupTable<ContentTypeField>) => {
  const props = {};

  Object.keys(fields).forEach((fieldId: string) => {
    const propValue = fields[fieldId].defaultValue;
    props[fieldId] = propValue;
  });

  return props;
};

const UndefinedControlType = () => {
  const { formatMessage } = useIntl();
  return <Alert severity="warning" children={formatMessage(messages.controlNotFound)} />;
};

export function AudiencesPanelUI(props: AudiencesPanelUIProps) {
  const classes = useStyles();
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
              const Control = controlsMap[type] ?? UndefinedControlType;
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
          <Grid className={classes.actionButtons}>
            <SecondaryButton variant="contained" onClick={() => onChange(getDefaultModel(fields))}>
              <FormattedMessage id="audiencesPanel.defaults" defaultMessage="Defaults" />
            </SecondaryButton>
            <PrimaryButton onClick={() => onSaveModel()}>
              <FormattedMessage id="audiencesPanel.apply" defaultMessage="Apply" />
            </PrimaryButton>
          </Grid>
        </>
      }
    </>
  );
}
