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

import React, { useMemo } from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { defineMessages, useIntl } from 'react-intl';
import moment from 'moment-timezone';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
// import DateFnsUtils from '@date-io/date-fns';
// import { KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider } from '@mui/lab/DatePicker';
import DatePicker from '@mui/lab/DatePicker';
import TimePicker from '@mui/lab/TimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { create8601String, get8601Pieces, getTimezones, TimezoneDescriptor } from '../../utils/datetime';
import FormControl from '@mui/material/FormControl';
import { nnou } from '../../utils/object';
import palette from '../../styles/palette';

export interface DateChangeData {
  date: Date;
  dateString: string;
  timeZoneName: string;
}

export interface DateTimePickerProps {
  id?: string;
  value: string | Date | number;
  timeZone: string;
  disabled?: boolean;
  classes?: any;
  controls?: Array<'date' | 'time' | 'timeZone'>; // options: ['date', 'time', 'timezone'], ['date', 'time'], ['date']
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

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: 'auto'
    },
    picker: {
      width: '100%',
      marginBottom: 0
    },
    pickerInput: {
      padding: '8px 12px',
      fontSize: '14px'
    },
    pickerButton: {
      position: 'absolute' as 'absolute',
      right: 0,
      '& button': {
        padding: '2px',
        marginRight: '10px'
      }
    },
    select: {
      padding: '8px 12px',
      borderRadius: '4px',
      marginTop: '16px',
      position: 'relative' as 'relative',
      backgroundColor: palette.white,
      fontSize: '14px'
    },
    selectIcon: {
      right: '12px',
      top: '22px'
    },
    autocompleteRoot: {
      marginTop: '16px'
    },
    autocompleteInputRoot: {
      paddingTop: '4px !important',
      paddingBottom: '4px !important',
      border: 'none'
    },
    autocompleteInput: {
      border: 'none',
      fontSize: '14px'
    },
    autocompleteEndAdornment: {
      right: '12px !important'
    }
  })
);

function DateTimePicker(props: DateTimePickerProps) {
  const {
    id,
    onChange,
    onDateChange,
    onTimeChange,
    onTimeZoneChange,
    onError,
    value,
    timeZone,
    disablePast,
    disabled = false,
    controls = ['date', 'time', 'timeZone'],
    localeCode = 'en-US',
    dateTimeFormatOptions
  } = props;
  // Time picker control seems to always display in function of the time of the
  // browser's time zone but we display things in function of the selected time zone.
  // This causes some discrepancies between the time displayed on the field and the time
  // displayed when the time picker is opened. `internalDate` is a transposed date/time
  // used to sync the timepicker with what's displayed to the user.
  const internalDate = useMemo(() => {
    const date = value ? new Date(value) : new Date();
    const localOffset = moment().format().substr(-6);
    const dateWithoutOffset = moment(date).tz(timeZone).format().substr(0, 19);
    return new Date(`${dateWithoutOffset}${localOffset}`);
  }, [value, timeZone]);
  const timeZones = getTimezones();
  const classes = useStyles();
  const hour12 = dateTimeFormatOptions?.hour12 ?? true;
  const currentTimeZoneDesc = timeZones.find((tz) => tz.name === unescape(timeZone));

  const { formatMessage } = useIntl();

  const createOnDateChange =
    (name: string) =>
    // Date/time change handler
    (newDate: unknown, input: string) => {
      console.log(`Check newDate type (${typeof newDate})`, newDate);
      if (newDate === null) {
        onError?.();
      }
      let changes: DateChangeData;
      const internalDatePieces = get8601Pieces(internalDate);
      const pickerDatePieces = get8601Pieces(newDate as string);
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
  const handleTimezoneChange = (event, value) => {
    const pieces = get8601Pieces(internalDate);
    // Keep date/time we had and apply new offset
    const dateString = create8601String(pieces[0], pieces[1], value.offset);
    const changes: DateChangeData = { date: new Date(dateString), dateString, timeZoneName: value.name };
    onTimeZoneChange?.(value);
    onTimeChange?.(changes);
    onDateChange?.(changes);
    onChange?.(changes);
  };

  const formControlProps = {};
  if (nnou(id)) {
    formControlProps['id'] = id;
  }

  return (
    <FormControl {...formControlProps} fullWidth>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {controls.includes('date') && (
          <DatePicker
            renderInput={(props) => <TextField {...props} />}
            value={internalDate}
            onChange={createOnDateChange('date')}
            className={classes.picker}
            InputAdornmentProps={{
              className: classes.pickerButton
            }}
            InputProps={{
              className: classes.pickerInput,
              disabled: true,
              placeholder: formatMessage(translations.datePlaceholder)
            }}
            disabled={disabled}
            disablePast={disablePast}
            // TODO: Check/Restore error state, helper text
            // error={!pickerState.dateValid}
            // helperText={pickerState.dateValid ? '' : formatMessage(translations.dateInvalidMessage)}
            // labelFunc={(date, invalidLabel) => invalidLabel || asLocalizedDateTime(date, localeCode)}
            // onClick={
            //   disabled
            //     ? null
            //     : () => {
            //         setDatePickerOpen(true);
            //       }
            // }
            // onAccept={() => {
            //   setDatePickerOpen(false);
            // }}
            // // Both clicking cancel and outside the calendar trigger onClose
            // onClose={() => {
            //   setDatePickerOpen(false);
            // }}
          />
        )}
        {controls.includes('time') && (
          <TimePicker
            value={internalDate}
            onChange={createOnDateChange('time')}
            className={classes.picker}
            InputAdornmentProps={{ className: classes.pickerButton }}
            InputProps={{ className: classes.pickerInput, placeholder: formatMessage(translations.timePlaceholder) }}
            disabled={disabled}
            // TODO: re-add helper text
            // helperText={pickerState.timeValid ? '' : formatMessage(translations.timeInvalidMessage)}
            ampm={hour12}
            inputFormat="HH:mm"
            mask="__:__"
            renderInput={(props) => <TextField {...props} />}
          />
        )}
      </LocalizationProvider>
      {controls.includes('timeZone') && (
        <Autocomplete
          options={timeZones}
          getOptionLabel={(timezone) => `${timezone.name} (GMT${timezone.offset})`}
          defaultValue={currentTimeZoneDesc}
          onChange={handleTimezoneChange}
          size="small"
          classes={{
            root: classes.autocompleteRoot,
            inputRoot: classes.autocompleteInputRoot,
            input: classes.autocompleteInput,
            endAdornment: classes.autocompleteEndAdornment
          }}
          popupIcon={<PublicRoundedIcon />}
          disableClearable={true}
          renderInput={(params) => <TextField {...params} variant="outlined" fullWidth />}
          disabled={disabled}
        />
      )}
    </FormControl>
  );
}

export default DateTimePicker;
