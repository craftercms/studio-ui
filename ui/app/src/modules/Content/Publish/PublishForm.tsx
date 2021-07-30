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
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Collapse from '@material-ui/core/Collapse';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Link from '@material-ui/core/Link';
import DateTimePicker from '../../../components/Controls/DateTimePicker';
import moment from 'moment';
import palette from '../../../styles/palette';
import TextFieldWithMax from '../../../components/Controls/TextFieldWithMax';
import GlobalState from '../../../models/GlobalState';
import FormLabel from '@material-ui/core/FormLabel';
import { useSelection } from '../../../utils/hooks/useSelection';
import Alert from '@material-ui/lab/Alert';

const messages = defineMessages({
  emailLabel: {
    id: 'publishForm.emailLabel',
    defaultMessage: "Email me the reviewer's feedback"
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
    id: 'publishForm.publishingTargetDropdownLabel',
    defaultMessage: 'Publishing Target'
  },
  environmentLoading: {
    id: 'publishForm.environmentLoading',
    defaultMessage: 'Loading...'
  },
  environmentError: {
    id: 'publishForm.environmentError',
    defaultMessage: 'Publishing targets load failed.'
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

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: 'auto'
    },
    title: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    checkboxes: {
      marginBottom: '10px'
    },
    formSection: {
      width: '100%',
      marginBottom: '20px'
    },
    formInputs: {
      fontSize: '14px'
    },
    selectInput: {
      padding: '10px 12px'
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
    environmentEmpty: {
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
        backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.paper : palette.gray.light2,
        borderRadius: '5px'
      }
    },
    radioGroup: {
      paddingTop: '10px',
      fontSize: '14px'
    },
    radioInput: {
      padding: '4px',
      marginLeft: '5px',
      marginRight: '5px'
    },
    selectIcon: {
      right: '12px'
    },
    mixedDatesWarningMessage: {
      marginBottom: '10px'
    },
    mixedTargetsWarningMessage: {
      marginTop: '10px'
    }
  })
);

let schedulingTimeout;

interface PublishFormProps {
  inputs: any;
  showEmailCheckbox: boolean;
  showRequestApproval: boolean;
  publishingChannels: any[];
  publishingChannelsStatus: string;
  onPublishingChannelsFailRetry: Function;
  disabled: boolean;
  mixedPublishingDates?: boolean;
  mixedPublishingTargets?: boolean;
  setSubmitDisabled: Function;
  classes?: any;

  setInputs(state: any): any;
}

function PublishForm(props: PublishFormProps) {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const {
    inputs,
    setInputs,
    showEmailCheckbox,
    showRequestApproval,
    publishingChannels,
    publishingChannelsStatus,
    onPublishingChannelsFailRetry,
    setSubmitDisabled,
    disabled = true,
    mixedPublishingDates,
    mixedPublishingTargets
  } = props;
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);

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
        schedulingTimeout = setTimeout(() => {
          setInputs({
            ...inputs,
            scheduling: 'now',
            scheduledDateTime: moment().format()
          });
        }, 2000);
      } else {
        clearTimeout(schedulingTimeout);
      }
    }
  };

  const handleSelectChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setInputs({ ...inputs, [name]: event.target.value as string });
  };

  const dateTimePickerChange = (scheduledDateTime: moment.Moment) => {
    setInputs({ ...inputs, scheduledDateTime: scheduledDateTime.format() });
    if (scheduledDateTime.toString() === 'Invalid date') {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  };

  return (
    <form className={classes.root}>
      <section className={classes.checkboxes}>
        {showRequestApproval && (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={inputs.requestApproval}
                onChange={handleInputChange('requestApproval')}
                disabled={disabled}
              />
            }
            label={<FormattedMessage id="publishForm.requestApproval" defaultMessage="Request approval" />}
          />
        )}

        {showEmailCheckbox && (
          <FormControlLabel
            label={formatMessage(messages.emailLabel)}
            control={
              <Checkbox
                size="small"
                checked={inputs.emailOnApprove}
                onChange={handleInputChange('emailOnApprove')}
                value="emailOnApprove"
                color="primary"
                disabled={disabled}
              />
            }
          />
        )}
      </section>
      <FormControl className={classes.formSection}>
        <FormLabel component="legend" htmlFor="environmentSelect">
          {formatMessage(messages.scheduling)}
        </FormLabel>
        <RadioGroup className={classes.radioGroup} value={inputs.scheduling} onChange={handleInputChange('scheduling')}>
          {mixedPublishingDates && (
            <Alert severity="warning" className={classes.mixedDatesWarningMessage}>
              <FormattedMessage
                id="publishForm.mixedPublishingDates"
                defaultMessage="Items have mixed publishing date/time schedules."
              />
            </Alert>
          )}
          <FormControlLabel
            value="now"
            control={<Radio color="primary" className={classes.radioInput} />}
            label={formatMessage(messages.schedulingNow)}
            classes={{
              label: classes.formInputs
            }}
            disabled={disabled}
          />
          <FormControlLabel
            value="custom"
            control={<Radio color="primary" className={classes.radioInput} />}
            label={formatMessage(messages.schedulingLater)}
            classes={{
              label: classes.formInputs
            }}
            disabled={disabled}
          />
        </RadioGroup>
        <Collapse
          in={inputs.scheduling === 'custom'}
          timeout={300}
          className={inputs.scheduling === 'custom' ? classes.datePicker : ''}
        >
          <DateTimePicker
            onChange={dateTimePickerChange}
            onError={() => setSubmitDisabled(true)}
            date={inputs.scheduledDateTime}
            localeCode={locale.localeCode}
            hour12={locale.dateTimeFormatOptions?.hour12 ?? true}
            timeZonePickerProps={{
              timezone: inputs.scheduledTimeZone
            }}
            datePickerProps={{
              disablePast: true
            }}
            disabled={disabled}
          />
        </Collapse>
      </FormControl>

      <FormControl fullWidth variant="outlined" className={classes.formSection}>
        <InputLabel>{formatMessage(messages.environment)}</InputLabel>
        {!publishingChannels && (
          <>
            <div className={classes.environmentLoaderContainer}>
              <Typography
                variant="body1"
                component="span"
                className={`${classes.environmentLoader} ${classes.formInputs}`}
                color={publishingChannelsStatus === 'Error' ? 'error' : 'initial'}
              >
                {formatMessage(messages[`environment${publishingChannelsStatus}`])}
                {publishingChannelsStatus === 'Error' && (
                  <Link href="#" onClick={() => onPublishingChannelsFailRetry()}>
                    ({formatMessage(messages.environmentRetry)})
                  </Link>
                )}
              </Typography>
            </div>
          </>
        )}

        {publishingChannels &&
          (publishingChannels.length ? (
            <Select
              fullWidth
              value={!mixedPublishingTargets && !inputs.environment ? 'live' : inputs.environment}
              onChange={handleSelectChange('environment')}
              disabled={disabled}
              label={formatMessage(messages.environment)}
            >
              {publishingChannels.map((publishingChannel: any) => (
                <MenuItem key={publishingChannel.name} value={publishingChannel.name}>
                  {publishingChannel.name}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <div className={classes.environmentLoaderContainer}>
              <Typography variant="body1" className={classes.environmentEmpty}>
                No publishing channels are available.
              </Typography>
            </div>
          ))}
        {mixedPublishingTargets && (
          <Alert severity="warning" className={classes.mixedTargetsWarningMessage}>
            <FormattedMessage
              id="publishForm.mixedPublishingTargets"
              defaultMessage="Items have mixed publishing targets."
            />
          </Alert>
        )}
      </FormControl>

      <TextFieldWithMax
        id="publishDialogFormSubmissionComment"
        name="submissionComment"
        label={<FormattedMessage id="publishForm.submissionComment" defaultMessage="Submission Comment" />}
        fullWidth
        onChange={handleInputChange('submissionComment')}
        value={inputs.submissionComment}
        multiline
        disabled={disabled}
      />
    </form>
  );
}

export default PublishForm;
