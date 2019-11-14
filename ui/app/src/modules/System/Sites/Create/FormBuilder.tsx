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

import React from "react";
import { Parameter } from "../../../../models/Blueprint";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { SiteState } from "../../../../models/Site";
import { defineMessages, useIntl } from "react-intl";
import PasswordTextField from "../../../../components/Controls/PasswordTextField";

interface FormBuilderProps {
  parameters: [Parameter];
  handleInputChange(event: React.ChangeEvent, type?: string): any;
  onKeyPress(event: React.KeyboardEvent): any;
  inputs: SiteState;
}

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
    '& .MuiGrid-item': {
      padding: '12px'
    }
  }
}));

const messages = defineMessages({
  required: {
    id: 'createSiteDialog.required',
    defaultMessage: '{name} is required.'
  },
});

export default function FormBuilder(props: FormBuilderProps) {
  const classes = useStyles({});
  const {parameters, handleInputChange, inputs, onKeyPress} = props;
  const { formatMessage } = useIntl();

  function renderHelperText(name:string, value:string = '', helperText:string, required:boolean, submitted:boolean) {
    if(required && !value && submitted) {
      return formatMessage(messages.required, {name: name})
    } else {
      return helperText;
    }
  }

  function renderParameters(parameters: [Parameter]) {
    return parameters.map((parameter, index) => {
      return (
        <Grid item xs={12} key={index}>
          {
            parameter.type === 'STRING'?
              <TextField
                id={parameter.name}
                fullWidth
                name={parameter.name}
                label={parameter.label}
                required={parameter.required}
                onKeyPress={onKeyPress}
                InputLabelProps={{shrink: !!parameter.defaultValue}}
                placeholder={parameter.defaultValue}
                onChange={(event) => handleInputChange(event, 'blueprintFields')}
                value={inputs.blueprintFields[parameter.name] ? inputs.blueprintFields[parameter.name] : ''}
                error={(parameter.required && inputs.submitted && !inputs.blueprintFields[parameter.name])}
                helperText={renderHelperText(parameter.label, inputs.blueprintFields[parameter.name], parameter.description, parameter.required, inputs.submitted)}
              />
              :
              <PasswordTextField
                id={parameter.name}
                fullWidth={true}
                name={parameter.name}
                label={parameter.label}
                required={parameter.required}
                onKeyPress={onKeyPress}
                onChange={(event: React.ChangeEvent) => handleInputChange(event, 'blueprintFields')}
                value={inputs.blueprintFields[parameter.name] ? inputs.blueprintFields[parameter.name] : ''}
                error={(parameter.required && inputs.submitted && !inputs.blueprintFields[parameter.name])}
                helperText={renderHelperText(parameter.label, inputs.blueprintFields[parameter.name], parameter.description, parameter.required, inputs.submitted)}
              />
          }
        </Grid>
      )
    })
  }

  return (
    <Grid container spacing={0} className={classes.container}>
      {renderParameters(parameters)}
    </Grid>
  )
}
