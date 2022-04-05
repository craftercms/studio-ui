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

import { useSpreadState } from '../../hooks';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { FormattedMessage } from 'react-intl';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import Stack from '@mui/material/Stack';
import DateTimePicker from '@mui/lab/DateTimePicker';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import React from 'react';

interface RangePickerModalProps {
  open: boolean;
  onAccept?(from: Date, to: Date): void;
  onClose(): void;
  onSwitchToTimelineClick?(): void;
}

export function RangePickerModal(props: RangePickerModalProps) {
  const { open, onAccept, onClose, onSwitchToTimelineClick } = props;
  // Can't ever have data before the release of CrafterCMS 4.0.0
  const minDate = new Date('2022-03-30T00:00:00.000Z');
  const today = new Date();
  const [{ pickerDateFrom, pickerDateTo }, setState] = useSpreadState({
    openRangePicker: true,
    dateFrom: null,
    dateTo: null,
    pickerDateFrom: null,
    pickerDateTo: null
  });
  const onDatePickerChange = (field, value) => {
    value.setSeconds(0);
    value.setMilliseconds(0);
    setState({ [field]: value });
  };
  const onRangePickerAccept = () => {
    // Because of the reverse chronological nature of the timeline, people
    // may confuse or have a different mental model of what to/from is.
    // Here we make sure dates are always coherent with what's expected on the back.
    if (pickerDateFrom < pickerDateTo) {
      onAccept(pickerDateFrom, pickerDateTo);
    } else {
      onAccept(pickerDateTo, pickerDateFrom);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="rangePickerModalTitle">
      <DialogTitle id="rangePickerModalTitle">
        <FormattedMessage id="activityDashlet.selectRangeModalTitle" defaultMessage="Select Date Range" />
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={1}>
              <DateTimePicker
                label={<FormattedMessage id="words.from" defaultMessage="From" />}
                minDate={minDate}
                renderInput={(params) => <TextField {...params} />}
                value={pickerDateFrom}
                onChange={(newValue) => {
                  onDatePickerChange('pickerDateFrom', newValue);
                }}
              />
              <DateTimePicker
                maxDate={today}
                minDate={minDate}
                label={<FormattedMessage id="words.to" defaultMessage="To" />}
                renderInput={(params) => <TextField {...params} />}
                value={pickerDateTo}
                onChange={(newValue) => {
                  onDatePickerChange('pickerDateTo', newValue);
                }}
              />
            </Stack>
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        {onSwitchToTimelineClick && (
          <SecondaryButton onClick={onSwitchToTimelineClick} sx={{ mr: 'auto' }}>
            <FormattedMessage id="activityDashlet.switchToTimeline" defaultMessage="Switch to timeline" />
          </SecondaryButton>
        )}
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton
          disabled={!(pickerDateFrom && pickerDateTo && pickerDateFrom.getTime() !== pickerDateTo.getTime())}
          onClick={onRangePickerAccept}
        >
          <FormattedMessage id="words.Accept" defaultMessage="Accept" />
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
}

export default RangePickerModal;
