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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import FormControlLabel, { formControlLabelClasses } from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import DateTimeTimezonePicker, { DateTimeTimezonePickerProps } from '../DateTimeTimezonePicker/DateTimeTimezonePicker';
import TextFieldWithMax from '../TextFieldWithMax/TextFieldWithMax';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import { capitalize } from '../../utils/string';
import { PublishDialogUIProps } from './utils';
import { PartialSxRecord } from '../../models';
import Box from '@mui/material/Box';
import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';

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

type PublishDialogFormSxKeys =
  | 'root'
  | 'title'
  | 'checkboxes'
  | 'formSection'
  | 'formInputs'
  | 'selectInput'
  | 'publishingTargetLoaderContainer'
  | 'publishingTargetLoader'
  | 'publishingTargetEmpty'
  | 'datePicker'
  | 'radioGroup'
  | 'radioInput'
  | 'selectIcon'
  | 'mixedDatesWarningMessage'
  | 'mixedTargetsWarningMessage';

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
  sxs?: PartialSxRecord<PublishDialogFormSxKeys>;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
};

export function PublishDialogForm(props: PublishFormProps) {
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
    onChange,
    sxs
  } = props;

  const handleDateTimePickerChange: DateTimeTimezonePickerProps['onChange'] = (date) => {
    onChange({
      target: {
        name: 'scheduledDateTime',
        type: 'dateTimePicker',
        // @ts-expect-error: We're formating this as a change event so ignoring "Type 'Date' is not assignable to type 'string'".
        value: date
      }
    });
  };

  return (
    <Box component="form" sx={{ width: 'auto', ...sxs?.root }}>
      <Box component="section" sx={{ marginBottom: '10px', ...sxs?.checkboxes }}>
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
      </Box>
      <FormControl fullWidth sx={{ width: '100%', marginBottom: '20px', ...sxs?.formSection }}>
        <FormLabel component="legend">{formatMessage(messages.scheduling)}</FormLabel>
        <RadioGroup
          sx={{ paddingTop: '10px', fontSize: '14px', ...sxs?.radioGroup }}
          value={state.scheduling}
          onChange={onChange}
          name="scheduling"
        >
          {mixedPublishingDates && (
            <Alert severity="warning" sx={{ marginBottom: '10px', ...sxs?.mixedDatesWarningMessage }}>
              <FormattedMessage
                id="publishForm.mixedPublishingDates"
                defaultMessage="Items have mixed publishing date/time schedules."
              />
            </Alert>
          )}
          <FormControlLabel
            value="now"
            control={
              <Radio
                color="primary"
                sx={{ padding: '4px', marginLeft: '5px', marginRight: '5px', ...sxs?.radioInput }}
              />
            }
            label={formatMessage(messages.schedulingNow)}
            sx={{ [`& .${formControlLabelClasses.label}`]: { fontSize: '14px', ...sxs?.formInputs } }}
            disabled={disabled}
          />
          <FormControlLabel
            value="custom"
            control={
              <Radio
                color="primary"
                sx={{ padding: '4px', marginLeft: '5px', marginRight: '5px', ...sxs?.radioInput }}
              />
            }
            label={
              published ? formatMessage(messages.schedulingLater) : formatMessage(messages.schedulingLaterDisabled)
            }
            sx={{ [`& .${formControlLabelClasses.label}`]: { fontSize: '14px', ...sxs?.formInputs } }}
            disabled={!published || disabled}
          />
        </RadioGroup>
        <Collapse
          mountOnEnter
          in={state.scheduling === 'custom'}
          timeout={300}
          sx={[
            state.scheduling === 'custom' && {
              position: 'relative',
              paddingLeft: '30px',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '5px',
                height: '100%',
                top: '0',
                left: '7px',
                backgroundColor: (theme) => theme.palette.background.paper,
                borderRadius: '5px'
              },
              ...(sxs?.datePicker as SystemStyleObject<Theme>)
            }
          ]}
        >
          <DateTimeTimezonePicker
            onChange={handleDateTimePickerChange}
            value={state.scheduledDateTime}
            disablePast
            disabled={disabled}
          />
        </Collapse>
      </FormControl>
      <FormControl fullWidth sx={{ width: '100%', marginBottom: '20px', ...sxs?.formSection }}>
        <FormLabel component="legend">{formatMessage(messages.publishingTarget)}</FormLabel>
        {publishingChannels ? (
          publishingChannels.length ? (
            <RadioGroup
              sx={{ paddingTop: '10px', fontSize: '14px', ...sxs?.radioGroup }}
              value={state.publishingTarget}
              onChange={onChange}
              name="publishingTarget"
            >
              {publishingChannels.map((publishingChannel) => (
                <FormControlLabel
                  key={publishingChannel.name}
                  disabled={disabled}
                  value={publishingChannel.name}
                  control={
                    <Radio
                      color="primary"
                      sx={{ padding: '4px', marginLeft: '5px', marginRight: '5px', ...sxs?.radioInput }}
                    />
                  }
                  label={
                    messages[publishingChannel.name]
                      ? formatMessage(messages[publishingChannel.name])
                      : capitalize(publishingChannel.name)
                  }
                  sx={{ [`& .${formControlLabelClasses.label}`]: { fontSize: '14px', ...sxs?.formInputs } }}
                />
              ))}
            </RadioGroup>
          ) : (
            <Box sx={{ paddingTop: '24px', display: 'inline-flex', ...sxs?.publishingTargetLoaderContainer }}>
              <Typography
                variant="body1"
                sx={{ padding: '10px 12px', borderRadius: '4px', width: '100%', ...sxs?.publishingTargetEmpty }}
              >
                No publishing channels are available.
              </Typography>
            </Box>
          )
        ) : (
          <Box sx={{ paddingTop: '24px', display: 'inline-flex', ...sxs?.publishingTargetLoaderContainer }}>
            <Typography
              variant="body1"
              component="span"
              sx={{
                border: '1px solid #ced4da',
                padding: '10px 12px',
                borderRadius: '4px',
                width: '100%',
                fontSize: '14px',
                ...sxs?.formInputs
              }}
              color={publishingTargetsStatus === 'Error' ? 'error' : 'initial'}
            >
              {formatMessage(messages[`publishingTarget${publishingTargetsStatus}`])}
              {publishingTargetsStatus === 'Error' && (
                <Link href="#" onClick={() => onPublishingChannelsFailRetry()}>
                  ({formatMessage(messages.publishingTargetRetry)})
                </Link>
              )}
            </Typography>
          </Box>
        )}
        {mixedPublishingTargets && (
          <Alert severity="warning" sx={{ marginTop: '10px', ...sxs?.mixedTargetsWarningMessage }}>
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
    </Box>
  );
}

export default PublishDialogForm;
