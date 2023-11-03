/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import { makeStyles } from 'tss-react/mui';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import DateTimePicker from '../DateTimePicker/DateTimePicker';
import TextFieldWithMax from '../TextFieldWithMax/TextFieldWithMax';
import GlobalState from '../../models/GlobalState';
import FormLabel from '@mui/material/FormLabel';
import { useSelection } from '../../hooks/useSelection';
import Alert from '@mui/material/Alert';
import { capitalize } from '../../utils/string';
import { PublishDialogUIProps } from './utils';

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
  schedulingLaterDisabled: {
    id: 'publishForm.schedulingLaterDisabled',
    defaultMessage: 'Later (disabled on first publish)'
  },
  publishingTarget: {
    id: 'common.publishingTarget',
    defaultMessage: 'Publishing Target'
  },
  publishingTargetLoading: {
    id: 'publishForm.publishingTargetLoading',
    defaultMessage: 'Loading...'
  },
  publishingTargetError: {
    id: 'publishForm.publishingTargetError',
    defaultMessage: 'Publishing targets load failed.'
  },
  publishingTargetRetry: {
    id: 'publishForm.publishingTargetRetry',
    defaultMessage: 'retry'
  },
  publishingTargetSuccess: {
    id: 'publishForm.publishingTargetSuccess',
    defaultMessage: 'Success'
  },
  submissionComment: {
    id: 'publishForm.submissionComment',
    defaultMessage: 'Submission Comment'
  },
  live: {
    id: 'words.live',
    defaultMessage: 'Live'
  },
  staging: {
    id: 'words.staging',
    defaultMessage: 'Staging'
  }
});

const useStyles = makeStyles()((theme) => ({
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
  publishingTargetLoaderContainer: {
    paddingTop: '24px',
    display: 'inline-flex'
  },
  publishingTargetLoader: {
    border: '1px solid #ced4da',
    padding: '10px 12px',
    borderRadius: '4px',
    width: '100%'
  },
  publishingTargetEmpty: {
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
      backgroundColor: theme.palette.background.paper,
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
}));

export type PublishFormProps = Pick<
  PublishDialogUIProps,
  | 'state'
  | 'published'
  | 'isRequestPublish'
  | 'showRequestApproval'
  | 'publishingTargetsStatus'
  | 'onPublishingChannelsFailRetry'
  | 'mixedPublishingDates'
  | 'mixedPublishingTargets'
  | 'submissionCommentRequired'
> & {
  publishingChannels: any[];
  disabled: boolean;
  classes?: any;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
};

export function PublishDialogForm(props: PublishFormProps) {
  const { classes } = useStyles();
  const { formatMessage } = useIntl();
  const {
    state,
    published,
    isRequestPublish,
    showRequestApproval,
    publishingChannels,
    publishingTargetsStatus,
    onPublishingChannelsFailRetry,
    disabled = true,
    mixedPublishingDates,
    mixedPublishingTargets,
    submissionCommentRequired,
    onChange
  } = props;

  const setSubmitDisabled = (...args) => void 0;
  const onDateTimeChange = setSubmitDisabled;

  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);

  const handleDateTimePickerChange = (dateChangeData) => {
    onChange({
      // @ts-ignore
      target: {
        name: 'scheduledDateTime',
        type: 'dateTimePicker',
        // @ts-ignore
        value: dateChangeData
      }
    });
  };

  const handleDatePickerError = () => {
    onDateTimeChange(null);
  };

  return (
    <form className={classes.root}>
      <section className={classes.checkboxes}>
        {showRequestApproval && (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={state.requestApproval}
                onChange={onChange}
                disabled={disabled}
                name="requestApproval"
              />
            }
            label={<FormattedMessage id="publishForm.requestApproval" defaultMessage="Request approval" />}
          />
        )}
        {isRequestPublish && (
          <FormControlLabel
            label={formatMessage(messages.emailLabel)}
            control={
              <Checkbox
                size="small"
                checked={state.emailOnApprove}
                onChange={onChange}
                value="emailOnApprove"
                color="primary"
                disabled={disabled}
                name="emailOnApprove"
              />
            }
          />
        )}
      </section>
      <FormControl fullWidth className={classes.formSection}>
        <FormLabel component="legend">{formatMessage(messages.scheduling)}</FormLabel>
        <RadioGroup className={classes.radioGroup} value={state.scheduling} onChange={onChange} name="scheduling">
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
            classes={{ label: classes.formInputs }}
            disabled={disabled}
          />
          <FormControlLabel
            value="custom"
            control={<Radio color="primary" className={classes.radioInput} />}
            label={
              published ? formatMessage(messages.schedulingLater) : formatMessage(messages.schedulingLaterDisabled)
            }
            classes={{ label: classes.formInputs }}
            disabled={!published || disabled}
          />
        </RadioGroup>
        <Collapse
          in={state.scheduling === 'custom'}
          timeout={300}
          className={state.scheduling === 'custom' ? classes.datePicker : ''}
        >
          <DateTimePicker
            onChange={handleDateTimePickerChange}
            onError={handleDatePickerError}
            value={state.scheduledDateTime}
            localeCode={locale.localeCode}
            dateTimeFormatOptions={locale.dateTimeFormatOptions}
            disablePast
            disabled={disabled}
          />
        </Collapse>
      </FormControl>
      <FormControl fullWidth className={classes.formSection}>
        <FormLabel component="legend">{formatMessage(messages.publishingTarget)}</FormLabel>
        {publishingChannels ? (
          publishingChannels.length ? (
            <RadioGroup
              className={classes.radioGroup}
              value={state.publishingTarget}
              onChange={onChange}
              name="publishingTarget"
            >
              {publishingChannels.map((publishingChannel) => (
                <FormControlLabel
                  key={publishingChannel.name}
                  disabled={disabled}
                  value={publishingChannel.name}
                  control={<Radio color="primary" className={classes.radioInput} />}
                  label={
                    messages[publishingChannel.name]
                      ? formatMessage(messages[publishingChannel.name])
                      : capitalize(publishingChannel.name)
                  }
                  classes={{ label: classes.formInputs }}
                />
              ))}
            </RadioGroup>
          ) : (
            <div className={classes.publishingTargetLoaderContainer}>
              <Typography variant="body1" className={classes.publishingTargetEmpty}>
                No publishing channels are available.
              </Typography>
            </div>
          )
        ) : (
          <div className={classes.publishingTargetLoaderContainer}>
            <Typography
              variant="body1"
              component="span"
              className={`${classes.publishingTargetLoader} ${classes.formInputs}`}
              color={publishingTargetsStatus === 'Error' ? 'error' : 'initial'}
            >
              {formatMessage(messages[`publishingTarget${publishingTargetsStatus}`])}
              {publishingTargetsStatus === 'Error' && (
                <Link href="#" onClick={() => onPublishingChannelsFailRetry()}>
                  ({formatMessage(messages.publishingTargetRetry)})
                </Link>
              )}
            </Typography>
          </div>
        )}
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
        onChange={onChange}
        value={state.submissionComment}
        multiline
        disabled={disabled}
        required={submissionCommentRequired}
      />
    </form>
  );
}

export default PublishDialogForm;
