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

import React, { useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { defineMessages, useIntl } from 'react-intl';
import moment, { Moment } from 'moment-timezone';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {
  asLocalizedDateTime,
  create8601String,
  get8601Pieces,
  getTimezones,
  getUserTimeZone,
  TimezoneDescriptor
} from '../../utils/datetime';
import FormControl from '@mui/material/FormControl';
import { nnou, nou } from '../../utils/object';
import { useSpreadState } from '../../hooks/useSpreadState';
import { UNDEFINED } from '../../utils/constants';
import useLocale from '../../hooks/useLocale';

export interface DateChangeData {
  date: Date;
  dateString: string;
  timeZoneName: string;
}

export interface DateTimePickerProps {
  id?: string;
  value: string | Date | number;
  disabled?: boolean;
  classes?: any;
  controls?: Array<'date' | 'time' | 'timeZone'>; // options: ['date', 'time', 'timezone'], ['date', 'time'], ['date']
  showTimeSelector?: boolean;
  showTimeZoneSelector?: boolean;
  disablePast?: boolean;
  localeCode: string;
  dateTimeFormatOptions: Intl.DateTimeFormatOptions;
  onError?(): void;
  onChange?(changes: DateChangeData): void;
  onDateChange?(changes: DateChangeData): void;
  onTimeChange?(changes: DateChangeData): void;
  onTimeZoneChange?(timeZone: TimezoneDescriptor): void;
}

const translations = defineMessages({
  datePlaceholder: {
    id: 'datetimepicker.datePlaceholder',
    defaultMessage: 'Date'
  },
  timePlaceholder: {
    id: 'datetimepicker.timePlaceholder',
    defaultMessage: 'Time'
  },
  dateInvalidMessage: {
    id: 'datetimepicker.dateInvalidMessage',
    defaultMessage: 'Invalid Date.'
  },
  timeInvalidMessage: {
    id: 'datetimepicker.timeInvalidMessage',
    defaultMessage: 'Invalid Time.'
  }
});

const useStyles = makeStyles()(() => ({
  popupIndicator: {
    padding: ' 8px',
    marginTop: '-6px',
    marginRight: '-7px'
  }
}));

function DateTimePicker(props: DateTimePickerProps) {
  const locale = useLocale();
  const {
    id,
    onChange,
    onDateChange,
    onTimeChange,
    onTimeZoneChange,
    onError,
    value,
    disablePast,
    disabled = false,
    showTimeSelector = true,
    showTimeZoneSelector = true,
    localeCode = 'en-US',
    dateTimeFormatOptions
  } = props;
  const timeZones = getTimezones();
  let offset = null;
  // MomentJS format returns a UTC string. When the timezone is GMT (zero), the formatted string will end with `Z`
  // instead of the offset string (+-HH:mm). We need to handle this case separately.
  if (value) {
    const formattedValue = moment.parseZone(value).format();
    if (formattedValue.endsWith('Z')) {
      // If the UTC string ends with `Z`, then the offset is `+00:00`.
      offset = '+00:00';
    } else {
      // Otherwise, the offset is the last 6 characters of the UTC string.
      offset = formattedValue.slice(-6);
    }
  }
  const timeZone = offset
    ? timeZones.find((tz) => tz.offset === offset).name
    : locale.dateTimeFormatOptions.timeZone ?? getUserTimeZone();
  // Time picker control seems to always display in function of the time of the
  // browser's time zone but we display things in function of the selected time zone.
  // This causes some discrepancies between the time displayed on the field and the time
  // displayed when the time picker is opened. `internalDate` is a transposed date/time
  // used to sync the timepicker with what's displayed to the user.
  const internalDate = useMemo(() => {
    if (nou(value)) {
      return null;
    }
    const date = new Date(value);
    const localOffset = moment().format().slice(-6);
    const dateWithoutOffset = moment(date).tz(timeZone).format().substring(0, 19);
    return new Date(`${dateWithoutOffset}${localOffset}`);
  }, [value, timeZone]);
  const { classes } = useStyles();
  const hour12 = dateTimeFormatOptions?.hour12 ?? true;
  const currentTimeZoneDesc = timeZones.find((tz) => tz.name === unescape(timeZone));
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [pickerState, setPickerState] = useSpreadState({
    dateValid: true,
    timeValid: true,
    timezoneValid: true
  });

  const { formatMessage } = useIntl();

  const createOnDateChange =
    (name: string) =>
    // Date/time change handler
    (newMoment: Moment) => {
      let newDate = newMoment.toDate();
      if (!newMoment.isValid()) {
        setPickerState({ dateValid: false });
        onError?.();
      }
      let changes: DateChangeData;
      const internalDatePieces = get8601Pieces(internalDate ?? newDate);
      const pickerDatePieces = get8601Pieces(newDate);
      switch (name) {
        case 'date': {
          // Grab the picker-sent date, keep the time we had
          const dateString = create8601String(pickerDatePieces[0], internalDatePieces[1], currentTimeZoneDesc.offset);
          changes = { dateString, date: new Date(dateString), timeZoneName: timeZone };
          onDateChange?.(changes);
          break;
        }
        case 'time': {
          // Grab the picker-sent time, keep the date we had
          const dateString = create8601String(internalDatePieces[0], pickerDatePieces[1], currentTimeZoneDesc.offset);
          changes = { dateString, date: new Date(dateString), timeZoneName: timeZone };
          onTimeChange?.(changes);
          break;
        }
      }
      onChange?.(changes);
    };

  // The idea is that when time zone is changed, it doesn't convert the
  // date to the new timezone but that you can select, date, time and timezone
  // individually without one changing the other fields.
  const handleTimezoneChange = (event, value: TimezoneDescriptor) => {
    const pieces = get8601Pieces(internalDate ?? new Date());
    // Keep date/time we had and apply new offset
    const dateString = create8601String(pieces[0], pieces[1], value.offset);
    const changes: DateChangeData = { date: new Date(dateString), dateString, timeZoneName: value.name };
    onTimeZoneChange?.(value);
    onTimeChange?.(changes);
    onDateChange?.(changes);
    onChange?.(changes);
  };

  const handlePopupOnlyInputChange = (event) => {
    event.preventDefault();
  };

  const formControlProps = {};
  if (nnou(id)) {
    formControlProps['id'] = id;
  }

  return (
    <FormControl {...formControlProps} fullWidth>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <DatePicker
          open={datePickerOpen}
          views={['year', 'month', 'day']}
          slotProps={{
            textField: {
              size: 'small',
              margin: 'normal',
              placeholder: formatMessage(translations.datePlaceholder),
              error: !pickerState.dateValid,
              helperText: pickerState.dateValid ? '' : formatMessage(translations.dateInvalidMessage),
              onClick: disabled
                ? null
                : () => {
                    setDatePickerOpen(true);
                  },
              inputProps: {
                value: internalDate ? asLocalizedDateTime(internalDate, localeCode) : '',
                onChange: handlePopupOnlyInputChange
              }
            }
          }}
          value={moment(internalDate)}
          onChange={createOnDateChange('date')}
          disabled={disabled}
          disablePast={disablePast}
          onAccept={() => {
            setDatePickerOpen(false);
          }}
          // Both clicking cancel and outside the calendar trigger onClose
          onClose={() => {
            setDatePickerOpen(false);
          }}
        />
        {showTimeSelector && (
          <TimePicker
            open={timePickerOpen}
            value={moment(internalDate)}
            onChange={createOnDateChange('time')}
            disabled={disabled}
            ampm={hour12}
            onOpen={() => setTimePickerOpen(true)}
            onAccept={() => setTimePickerOpen(false)}
            onClose={() => setTimePickerOpen(false)}
            slotProps={{
              textField: {
                size: 'small',
                margin: 'normal',
                helperText: pickerState.timeValid ? '' : formatMessage(translations.timeInvalidMessage),
                placeholder: formatMessage(translations.timePlaceholder),
                onClick: disabled
                  ? null
                  : () => {
                      setTimePickerOpen(true);
                    },
                inputProps: {
                  onChange: handlePopupOnlyInputChange,
                  value: asLocalizedDateTime(internalDate, localeCode, {
                    hour12,
                    hour: dateTimeFormatOptions?.hour || '2-digit',
                    minute: dateTimeFormatOptions?.minute || '2-digit',
                    // If the timezone control isn't displayed, the time displayed may
                    // be misleading/unexpected to the user, so if timezone isn't displayed,
                    // display timezone here.
                    timeZoneName: showTimeZoneSelector ? UNDEFINED : 'short'
                  })
                }
              }
            }}
          />
        )}
      </LocalizationProvider>
      {showTimeZoneSelector && (
        <Autocomplete
          options={timeZones}
          getOptionLabel={(timezone) => {
            return currentTimeZoneDesc.name === timezone.name
              ? `GMT${timezone.offset}`
              : typeof timezone === 'string'
                ? timezone
                : `${timezone.name} (GMT${timezone.offset})`;
          }}
          value={currentTimeZoneDesc}
          onChange={handleTimezoneChange}
          size="small"
          classes={{
            popupIndicator: classes.popupIndicator
          }}
          popupIcon={<PublicRoundedIcon />}
          disableClearable={true}
          renderInput={(params) => <TextField size="small" margin="normal" {...params} variant="outlined" fullWidth />}
          disabled={disabled}
        />
      )}
    </FormControl>
  );
}

export default DateTimePicker;
