import React, { useEffect, useState } from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from "react-intl";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from "@material-ui/core/Checkbox";
import NativeSelect from '@material-ui/core/NativeSelect';
import { InputLabel } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Collapse from '@material-ui/core/Collapse';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import DateTimePicker from './DateTimePicker';

interface PublishFormProps {
  inputs: any;
  setInputs(state: any): any;
  showEmailCheckbox: boolean;
  siteId: string;
  publishingChannels: any[];
}

function PublishForm(props: PublishFormProps) {
  const { inputs, setInputs, showEmailCheckbox, siteId, publishingChannels } = props;

  const handleInputChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();

    if (e.target.type === 'checkbox') {
      setInputs({ ...inputs, [name]: e.target.checked });
    } else if (e.target.type === 'radio') {
      setInputs({ ...inputs, [name]: e.target.value })
    };
  };

  const handleSelectChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setInputs({ ...inputs, [name]: event.target.value as string });
  };

  return (
    <form>
      {
        showEmailCheckbox &&
        <FormControlLabel
          control={
            <Checkbox
              checked={inputs.emailOnApprove}
              onChange={handleInputChange('emailOnApprove')}
              value="emailOnApprove"
              color="primary"
            />
          }
          label="Email me when items are approved"
        />
      }

      <InputLabel htmlFor="environmentSelect">Scheduling</InputLabel>
      <RadioGroup
        value={inputs.scheduling}
        onChange={handleInputChange('scheduling')}
      >
        <FormControlLabel
          value="now"
          control={<Radio color="primary" />}
          label="Now"
        />
        <FormControlLabel
          value="custom"
          control={<Radio color="primary" />}
          label="Later"
        />
      </RadioGroup>

      <Collapse in={inputs.scheduling === 'custom'} timeout={300}>
        <DateTimePicker inputs={inputs} setInputs={setInputs}/>
      </Collapse>

      <FormControl>
        <InputLabel>Environment</InputLabel>
        <Select
          fullWidth
          value={inputs.environment}
          onChange={handleSelectChange('environment')}
        >
          {
            publishingChannels.map((publishingChannel: any) =>
              <MenuItem key={publishingChannel.name} value={publishingChannel.name}>{publishingChannel.name}</MenuItem>
            )
          }
        </Select>
      </FormControl>

      <TextField
        id="sandboxBranch"
        name="sandboxBranch"
        label={'Submission Comment'}
        fullWidth
        // onKeyPress={onKeyPress}
        onChange={handleInputChange('submissionComment')}
        InputLabelProps={{ shrink: true }}
        value={inputs.submissionComment}
      />
    </form>
  )
}

export default PublishForm;
