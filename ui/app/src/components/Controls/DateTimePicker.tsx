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

import React, { useMemo, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { defineMessages, useIntl } from 'react-intl';
import moment from 'moment-timezone';
import AccessTimeIcon from '@material-ui/icons/AccessTimeRounded';
import PublicRoundedIcon from '@material-ui/icons/PublicRounded';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { asLocalizedDateTime, getTimezones, TimezoneDescriptor } from '../../utils/datetime';
import FormControl from '@material-ui/core/FormControl';
import { nnou } from '../../utils/object';
import palette from '../../styles/palette';
import { preFill } from '../../utils/string';
import { UNDEFINED } from '../../utils/constants';
import { useSpreadState } from '../../utils/hooks/useSpreadState';

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

const createDateString = ({ year, month, day, hours, minutes, seconds, offset }) =>
  `${year}-${preFill(month + 1)}-${preFill(day)}T${preFill(hours)}:${preFill(minutes)}:${preFill(seconds)}${offset}`;

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
  const { date, internalDate } = useMemo(() => {
    const date = value ? new Date(value) : new Date();
    const localOffset = moment()
      .format()
      .substr(-6);
    const dateWithoutOffset = moment(date)
      .tz(timeZone)
      .format()
      .substr(0, 19);
    const internalDate = new Date(`${dateWithoutOffset}${localOffset}`);
    return { date, internalDate };
  }, [value, timeZone]);
  const timeZones = getTimezones();
  const classes = useStyles();
  const hour12 = dateTimeFormatOptions?.hour12 ?? true;
  const [pickerState, setPickerState] = useSpreadState({
    dateValid: true,
    timeValid: true,
    timezoneValid: true
  });
  const currentTimeZoneDesc = timeZones.find((tz) => tz.name === unescape(timeZone));

  const { formatMessage } = useIntl();

  const createOnDateChange = (name: string) =>
    // Date/time change handler
    (newDate: Date | null) => {
      if (newDate === null) {
        setPickerState({ dateValid: false });
        onError?.();
      }
      let changes: DateChangeData;
      switch (name) {
        case 'date': {
          const dateString: string = moment(newDate)
            .tz(timeZone)
            .format();
          changes = { dateString, date: newDate, timeZoneName: timeZone };
          onDateChange?.(changes);
          break;
        }
        case 'time': {
          // Time gets selected in the user's browser timezone but
          // then gets converted to selected timezone
          const timeOfDay = asLocalizedDateTime(newDate, localeCode, {
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
          })
            .split(':')
            .map((n) => parseInt(n));
          const dateString = createDateString({
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
            hours: timeOfDay[0],
            minutes: timeOfDay[1],
            seconds: timeOfDay[2],
            offset: currentTimeZoneDesc.offset
          });
          changes = { dateString, date: new Date(dateString), timeZoneName: timeZone };
          onTimeChange?.(changes);
          break;
        }
      }
      setPickerState({ dateValid: true });
      onChange?.(changes);
    };

  // The idea is that when time zone is changed, it doesn't convert the
  // date to the new timezone but that you can select, date, time and timezone
  // individually without one changing the other fields.
  const handleTimezoneChange = (event, value) => {
    const timeOfDay = asLocalizedDateTime(date, localeCode, {
      timeZone,
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
      .split(':')
      .map((n) => parseInt(n));
    const dateString = createDateString({
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      hours: timeOfDay[0],
      minutes: timeOfDay[1],
      seconds: timeOfDay[2],
      offset: value.offset
    });
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

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <FormControl {...formControlProps} fullWidth>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {controls.includes('date') && (
          <KeyboardDatePicker
            open={datePickerOpen}
            margin="normal"
            value={date}
            onChange={createOnDateChange('date')}
            className={classes.picker}
            InputAdornmentProps={{
              className: classes.pickerButton
            }}
            inputProps={{
              className: classes.pickerInput,
              disabled: true
            }}
            placeholder={formatMessage(translations.datePlaceholder)}
            disabled={disabled}
            disablePast={disablePast}
            error={!pickerState.dateValid}
            helperText={pickerState.dateValid ? '' : formatMessage(translations.dateInvalidMessage)}
            labelFunc={(date, invalidLabel) => invalidLabel || asLocalizedDateTime(date, localeCode)}
            onClick={() => {
              setDatePickerOpen(true);
            }}
            onAccept={() => {
              setDatePickerOpen(false);
            }}
            // Both clicking cancel and outside the calendar trigger onClose
            onClose={() => {
              setDatePickerOpen(false);
            }}
          />
        )}
        {controls.includes('time') && (
          <KeyboardTimePicker
            margin="normal"
            value={internalDate}
            onChange={createOnDateChange('time')}
            keyboardIcon={<AccessTimeIcon />}
            className={classes.picker}
            InputAdornmentProps={{ className: classes.pickerButton }}
            inputProps={{ className: classes.pickerInput }}
            placeholder={formatMessage(translations.timePlaceholder)}
            disabled={disabled}
            error={!pickerState.timeValid}
            helperText={pickerState.timeValid ? '' : formatMessage(translations.timeInvalidMessage)}
            ampm={hour12}
            labelFunc={(date, invalidLabel) =>
              invalidLabel ||
              asLocalizedDateTime(internalDate, localeCode, {
                hour12,
                hour: dateTimeFormatOptions?.hour || '2-digit',
                minute: dateTimeFormatOptions?.minute || '2-digit',
                // If the timezone control isn't displayed, the time displayed may
                // be misleading/unexpected to the user, so if timezone isn't displayed,
                // display timezone here.
                timeZoneName: controls.includes('timeZone') ? UNDEFINED : 'short'
              })
            }
          />
        )}
      </MuiPickersUtilsProvider>
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
