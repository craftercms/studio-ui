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

import React from 'react';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import { defineMessages, useIntl } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Collapse from '@material-ui/core/Collapse';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import Link from '@material-ui/core/Link';
import DateTimePicker from '../../../components/DateTimePicker';
import moment from 'moment';
import { palette } from '../../../styles/theme';

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
  environmentLoading: {
    id: 'publishForm.environmentLoading',
    defaultMessage: 'Loading...'
  },
  environmentError: {
    id: 'publishForm.environmentError',
    defaultMessage: 'Failed to load environments.'
  },
  environmentRetry: {
    id: 'publishForm.environmentRetry',
    defaultMessage: 'retry'
  },
  environmentSuccess: {
    id: 'publishForm.environmentSuccess',
    defaultMessage: 'Success'
  },
  submissionComment: {
    id: 'publishForm.submissionComment',
    defaultMessage: 'Submission Comment'
  }
});

const useStyles = makeStyles(() => createStyles({
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
  sectionLabel: {
    color: palette.black,
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
    backgroundColor: palette.white
  },
  environmentLoaderContainer: {
    paddingTop: '24px',
    display: 'inline-flex'
  },
  environmentLoader: {
    border: '1px solid #ced4da',
    padding: '10px 12px',
    borderRadius: '4px',
    width: '100%'
  },
  datePicker: {
    position: 'relative',
    paddingLeft: '30px',
    paddingBottom: '20px',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '5px',
      height: '100%',
      top: '0',
      left: '7px',
      backgroundColor: palette.gray.light2,
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
  textField: {
    backgroundColor: palette.white,
    padding: 0
  }
}));

const SelectInput = withStyles(() => createStyles({
  input: {
    borderRadius: 4
  }
}))(InputBase);

interface PublishFormProps {
  inputs: any;

  setInputs(state: any): any;

  showEmailCheckbox: boolean;
  publishingChannels: any[];
  publishingChannelsStatus: string;
  onPublishingChannelsFailRetry: Function;
  setSubmitDisabled: Function;
  classes?: any;
}

function PublishForm(props: PublishFormProps) {

  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const {
    inputs,
    setInputs,
    showEmailCheckbox,
    publishingChannels,
    publishingChannelsStatus,
    onPublishingChannelsFailRetry,
    setSubmitDisabled
  } = props;

  const handleInputChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();

    if (e.target.type === 'checkbox') {
      setInputs({ ...inputs, [name]: e.target.checked });
    } else if (e.target.type === 'textarea') {
      setInputs({ ...inputs, [name]: e.target.value });
    } else if (e.target.type === 'radio') {
      const inputValue = e.target.value;
      setInputs({ ...inputs, [name]: inputValue });

      if (inputValue === 'now') {
        setTimeout(() => {
          setInputs({
            ...inputs,
            'scheduling': 'now',
            'scheduledDateTime': moment().format()
          });
        }, 2000);
      }
    }
  };

  const handleSelectChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setInputs({ ...inputs, [name]: event.target.value as string });
  };

  const dateTimePickerChange = (scheduledDateTime: moment.Moment) => {
    setInputs({ ...inputs, 'scheduledDateTime': scheduledDateTime.format() });
    if (scheduledDateTime.toString() === 'Invalid date') {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  };

  return (
    <form className={classes.root}>
      {
        showEmailCheckbox &&
        <div className={classes.formSection}>
          <FormControlLabel
            label={formatMessage(messages.emailLabel)}
            className={classes.sectionLabel}
            control={
              <Checkbox
                className={classes.checkboxInput}
                checked={inputs.emailOnApprove}
                onChange={handleInputChange('emailOnApprove')}
                value="emailOnApprove"
                color="primary"
              />
            }
          />
        </div>
      }

      <div className={classes.formSection}>
        <InputLabel
          htmlFor="environmentSelect"
          className={classes.sectionLabel}>
          {formatMessage(messages.scheduling)}
        </InputLabel>
        <RadioGroup
          className={classes.radioGroup}
          value={inputs.scheduling}
          onChange={handleInputChange('scheduling')}
        >
          <FormControlLabel
            value="now"
            control={<Radio color="primary" className={classes.radioInput}/>}
            label={formatMessage(messages.schedulingNow)}
            classes={{
              label: classes.formInputs
            }}
          />
          <FormControlLabel
            value="custom"
            control={<Radio color="primary" className={classes.radioInput}/>}
            label={formatMessage(messages.schedulingLater)}
            classes={{
              label: classes.formInputs
            }}
          />
        </RadioGroup>
        <Collapse
          in={inputs.scheduling === 'custom'}
          timeout={300}
          className={inputs.scheduling === 'custom' ? (classes.datePicker) : ''}
        >
          <DateTimePicker
            onChange={dateTimePickerChange}
            onError={() => setSubmitDisabled(true)}
            date={inputs.scheduledDateTime}
            timeZonePickerProps={{
              timezone: inputs.scheduledTimeZone
            }}
          />
        </Collapse>
      </div>

      <div className={classes.formSection}>
        <FormControl fullWidth>
          <InputLabel className={classes.sectionLabel}>{formatMessage(messages.environment)}</InputLabel>
          {
            !publishingChannels &&
            <>
              <div className={classes.environmentLoaderContainer}>
                <Typography
                  variant="body1"
                  component="span"
                  className={`${classes.environmentLoader} ${classes.formInputs}`}
                  color={publishingChannelsStatus === 'Error' ? 'error' : 'initial'}
                >
                  {formatMessage(messages[`environment${publishingChannelsStatus}`])}
                  {
                    publishingChannelsStatus === 'Error' &&
                    <Link href="#" onClick={() => onPublishingChannelsFailRetry()}>
                      ({formatMessage(messages.environmentRetry)})
                    </Link>
                  }
                </Typography>
              </div>
            </>
          }

          {
            publishingChannels &&
            <Select
              fullWidth
              style={{ borderRadius: '4px' }}
              value={inputs.environment}
              classes={{
                select: `${classes.selectInput} ${classes.formInputs}`,
                icon: classes.selectIcon
              }}
              onChange={handleSelectChange('environment')}
              input={<SelectInput/>}
            >
              {
                publishingChannels.map((publishingChannel: any) =>
                  <MenuItem key={publishingChannel.name} value={publishingChannel.name}>
                    {publishingChannel.name}
                  </MenuItem>
                )
              }
            </Select>
          }

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
        InputProps={{
          className: classes.textField
        }}
      />
    </form>
  );
}

export default PublishForm;
