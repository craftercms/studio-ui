import React, { useEffect, useState } from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
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
import moment from 'moment';

const messages = defineMessages({
  emailLabel: {
    id: 'publishForm.emailLabel',
    defaultMessage: 'Email me when items are approved'
  },
  scheduling: {
    id: 'publishForm.scheduling',
    defaultMessage: 'Scheduling'
  },
  schedulingNow: {
    id: 'publishForm.schedulingNow',
    defaultMessage: 'Now'
  },
  schedulingLater: {
    id: 'publishForm.schedulingLater',
    defaultMessage: 'Later'
  },
  environment: {
    id: 'publishForm.environment',
    defaultMessage: 'Environment'
  },
  submissionComment: {
    id: 'publishForm.submissionComment',
    defaultMessage: 'Submission Comment'
  }
});

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
    marginBottom: '20px'
  },
  sectionLabel :{
    color: '#000',
    width: '100%',
    fontSize: '16px'
  },
  formInputs: {
    fontSize: '14px'
  },
  checkboxInput: {
    paddingTop: 0,
    paddingBottom: 0
  },
  selectInput: {
    padding: '10px 12px',
    backgroundColor: '#fff'
  },
  datePicker: {
    position: 'relative' as 'relative',
    paddingLeft: '30px',
    paddingBottom: '20px',
    "&::before": {
      content: "''",
      position: 'absolute' as 'absolute',
      width: '5px',
      height: '100%',
      top: '0',
      left: '7px',
      backgroundColor: '#F2F2F7',
      borderRadius: '5px'
    }
  },
  radioGroup: {
    paddingTop: '10px',
    fontSize: '14px'
  },
  radioInput: {
    paddingBottom: '4px',
    paddingTop: '4px'
  },
  selectIcon: {
    right: '12px'
  },
  submissionTextField: {
    paddingBottom: 0
  },
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
  publishingChannels: any[];
  classes?: any;
}

const PublishForm = withStyles(publishFormStyles)((props: PublishFormProps) => {

  const { classes, inputs, setInputs, showEmailCheckbox, publishingChannels } = props;
  const { formatMessage } = useIntl();

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
  };

  const handleSelectChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setInputs({ ...inputs, [name]: event.target.value as string });
  };

  const dateTimePickerChange = (scheduledDateTime: moment.Moment) => {
    setInputs({ ...inputs, 'scheduledDateTime': scheduledDateTime.format() });
  }

  return (
    <form className={classes.root}>
      {
        showEmailCheckbox &&
        <div className={classes.formSection}>
          <FormControlLabel className={classes.sectionLabel}
            control={
              <Checkbox
                className={classes.checkboxInput}
                checked={inputs.emailOnApprove}
                onChange={handleInputChange('emailOnApprove')}
                value="emailOnApprove"
                color="primary"
              />
            }
            label={formatMessage(messages.emailLabel)}
          />
        </div>
      }

      <div className={classes.formSection}>
        <InputLabel htmlFor="environmentSelect" className={classes.sectionLabel}>{ formatMessage(messages.scheduling) }</InputLabel>
        <RadioGroup
          className={ classes.radioGroup }
          value={inputs.scheduling}
          onChange={handleInputChange('scheduling')}
        >
          <FormControlLabel
            value="now"
            control={<Radio color="primary" className={ classes.radioInput } />}
            label={ formatMessage(messages.schedulingNow) }
            classes={{
              label: classes.formInputs
            }}
          />
          <FormControlLabel
            value="custom"
            control={<Radio color="primary" className={ classes.radioInput } />}
            label={ formatMessage(messages.schedulingLater) }
            classes={{
              label: classes.formInputs
            }}
          />
        </RadioGroup>
        <Collapse in={inputs.scheduling === 'custom'} timeout={300} className={ inputs.scheduling === 'custom' ? (classes.datePicker) : '' }>
          <DateTimePicker onChange={dateTimePickerChange} timezone={inputs.scheduledTimeZone}/>
        </Collapse>
      </div>

      <div className={classes.formSection}>
        <FormControl fullWidth>
          <InputLabel className={classes.sectionLabel}>{ formatMessage(messages.submissionComment) }</InputLabel>
          <Select
            fullWidth
            style={{ borderRadius: '4px' }}
            value={inputs.environment}
            classes={{
              select: `${classes.selectInput} ${classes.formInputs}`,
              icon: classes.selectIcon
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
        className={classes.submissionTextField}
        id="sandboxBranch"
        name="sandboxBranch"
        label={<span className={classes.sectionLabel}>Submission Comment</span>}
        fullWidth
        onChange={handleInputChange('submissionComment')}
        InputLabelProps={{ shrink: true }}
        value={inputs.submissionComment}
        multiline
        rows={inputs.scheduling === 'custom' ? '1': '6'}
        classes={{

        }}
      />
    </form>
  )
});

export default PublishForm;
