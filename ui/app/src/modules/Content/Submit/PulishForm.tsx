import React, { useEffect, useState } from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { FormattedMessage } from "react-intl";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from "@material-ui/core/Checkbox";
import { InputLabel } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Collapse from '@material-ui/core/Collapse';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';

import DateTimePicker from './DateTimePicker';

const publishFormStyles = () => ({
  root: {
    width: 'auto'
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  formSection: {
    marginBottom: '10px'
  },
  sectionLabel :{
    color: '#000',
    width: '100%'
  },
  selectInput: {
    padding: '10px 12px'
  },
  datePicker: {
    position: 'relative' as 'relative',
    "&::before": {
      content: '',
      position: 'absolute' as 'absolute',
      width: '5px',
      height: '100%',
      top: '0',
      left: '0',
      backgroundColor: '#F2F2F7',
      borderRadius: '5px'
    }
  }
});

const SelectInput = withStyles(() =>
  createStyles({
    input: {
      borderRadius: 4
    },
  }),
)(InputBase);

interface PublishFormProps {
  inputs: any;
  setInputs(state: any): any;
  showEmailCheckbox: boolean;
  siteId: string;
  publishingChannels: any[];
  classes?: any;
}

const PublishForm = withStyles(publishFormStyles)((props: PublishFormProps) => {

  const { classes, inputs, setInputs, showEmailCheckbox, siteId, publishingChannels } = props;

  useEffect(
    () => {
      if (publishingChannels.length > 0) {
        setInputs({ ...inputs, 'environment': publishingChannels[0].name });
      }
    },
    // eslint-disable-next-line
    []
  );

  const handleInputChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();

    if (e.target.type === 'checkbox') {
      setInputs({ ...inputs, [name]: e.target.checked });
    } else if (e.target.type === 'radio' || e.target.type === 'textarea') {
      setInputs({ ...inputs, [name]: e.target.value })
    };

    console.log(e.target.type)
  };

  const handleSelectChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setInputs({ ...inputs, [name]: event.target.value as string });
  };

  return (
    <form className={classes.root}>
      {
        showEmailCheckbox &&
        <div className={classes.formSection}>
          <FormControlLabel className={classes.sectionLabel}
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
        </div>
      }

      <div className={classes.formSection}>
        <InputLabel htmlFor="environmentSelect" className={classes.sectionLabel}>Scheduling</InputLabel>
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

        <Collapse in={inputs.scheduling === 'custom'} timeout={300} className={classes.datePicker}>
          <DateTimePicker inputs={inputs} setInputs={setInputs}/>
        </Collapse>
      </div>

      <div className={classes.formSection}>
        <FormControl fullWidth>
          <InputLabel className={classes.sectionLabel}>Environment</InputLabel>
          <Select
            fullWidth
            style={{ borderRadius: '4px' }}
            value={inputs.environment}
            classes={{
              select: classes.selectInput
            }}
            onChange={handleSelectChange('environment')}
            input={<SelectInput />}
          >
            {
              publishingChannels.map((publishingChannel: any) =>
                <MenuItem key={publishingChannel.name} value={publishingChannel.name}>{publishingChannel.name}</MenuItem>
              )
            }
          </Select>
        </FormControl>
      </div>

      <TextField
        id="sandboxBranch"
        name="sandboxBranch"
        label={<span className={classes.sectionLabel}>Submission Comment</span>}
        fullWidth
        onChange={handleInputChange('submissionComment')}
        InputLabelProps={{ shrink: true }}
        value={inputs.submissionComment}
        multiline
        rows={inputs.scheduling === 'custom' ? '1': '4'}
      />
    </form>
  )
});

export default PublishForm;
