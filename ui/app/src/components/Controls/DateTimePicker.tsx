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

import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { defineMessages, useIntl } from 'react-intl';
import moment from 'moment-timezone';
import AccessTimeIcon from '@material-ui/icons/AccessTimeRounded';
import PublicRoundedIcon from '@material-ui/icons/PublicRounded';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getTimezones } from '../../utils/datetime';
import FormControl from '@material-ui/core/FormControl';
import { nnou, nou } from '../../utils/object';
import palette from '../../styles/palette';

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

interface DateTimePickerProps {
  id?: string;
  onChange?: Function;
  onError?: Function;
  date?: string | moment.Moment | Number;
  disabled?: boolean;
  classes?: any;
  controls?: string[]; // options: ['date', 'time', 'timezone'], ['date', 'time'], ['date']
  datePickerProps?: {
    dateFormat?: string;
    onDateChange?: Function;
    disablePast?: boolean;
  };
  timePickerProps?: {
    timeFormat?: string;
    onTimeChange?: Function;
  };
  timeZonePickerProps?: {
    timezone?: string;
    onTimezoneChange?: Function;
  };
  localeCode?: string;
}

const useStyles = makeStyles((theme: Theme) =>
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

interface timezoneType {
  timezoneName: string;
  timezoneOffset: string;
}

const timezones = getTimezones();

const getDateTimeMoment = (dateString, timezoneObj) => {
  let dateMoment;

  switch (typeof dateString) {
    case 'string':
    case 'number':
      dateMoment = timezoneObj ? moment.tz(dateString, timezoneObj.timezoneName) : moment.tz(dateString);
      break;
    case 'object':
      // moment object, stays the same
      dateMoment = dateString;
      break;
    default:
      dateMoment = moment();
  }

  return dateMoment;
};

function DateTimePicker(props: DateTimePickerProps) {
  const {
    id,
    onChange,
    onError,
    date = moment(),
    disabled = false,
    controls = ['date', 'time', 'timezone'],
    datePickerProps = {},
    timePickerProps = {},
    timeZonePickerProps = {},
    localeCode
  } = props;
  const classes = useStyles({});
  const [pickerState, setPickerState] = useState({
    dateValid: true,
    timeValid: true,
    timezoneValid: true
  });

  // Set defaults on wrapped controls props
  if (nou(timeZonePickerProps.timezone)) {
    timeZonePickerProps['timezone'] = moment.tz.guess();
  }
  if (nou(datePickerProps.dateFormat)) {
    datePickerProps['dateFormat'] = 'YYYY-MM-DD';
  }
  if (nou(datePickerProps.disablePast)) {
    datePickerProps['disablePast'] = false;
  }
  if (nou(timePickerProps.timeFormat)) {
    timePickerProps['timeFormat'] = 'HH:mm';
  }

  let dateMoment;
  let timeMoment;
  let timezoneObj = timezones.find((tz) => tz.timezoneName === unescape(timeZonePickerProps.timezone));
  dateMoment = getDateTimeMoment(date, timezoneObj);
  timeMoment = getDateTimeMoment(date, timezoneObj);
  const { formatMessage } = useIntl();

  const handleDateChange = (name: string) => (newDate: Date | null) => {
    let updatedDateTime = moment(newDate);
    const timeObj = timeMoment.toDate();
    const dateObj = dateMoment.toDate();

    switch (name) {
      case 'scheduledDate':
        if (updatedDateTime._isValid) {
          updatedDateTime.hours(timeObj.getHours());
          updatedDateTime.minutes(timeObj.getMinutes());
          updatedDateTime.seconds(timeObj.getSeconds());
          updatedDateTime.milliseconds(timeObj.getMilliseconds());
          datePickerProps?.onDateChange?.(updatedDateTime.format(datePickerProps.dateFormat));
          setPickerState({ ...pickerState, dateValid: true });
        } else {
          setPickerState({ ...pickerState, dateValid: false });
          onError?.();
        }
        break;
      case 'scheduledTime':
        if (updatedDateTime._isValid) {
          updatedDateTime.date(dateObj.getDate());
          updatedDateTime.month(dateObj.getMonth());
          updatedDateTime.year(dateObj.getFullYear());
          timePickerProps?.onTimeChange?.(updatedDateTime.format(timePickerProps.timeFormat));
          setPickerState({ ...pickerState, timeValid: true });
        } else {
          setPickerState({ ...pickerState, timeValid: false });
          onError?.();
        }
        break;
    }

    if (updatedDateTime._isValid) {
      onChange?.(updatedDateTime);
    }
  };

  const handleTimezoneChange = (event: React.ChangeEvent<{}>, timezoneObj: any) => {
    const timezone = timezoneObj.timezoneName,
      updatedDateTime = moment.tz(
        dateMoment.format(),
        `${datePickerProps.dateFormat} ${timePickerProps.timeFormat}`,
        timezone
      );

    timeZonePickerProps?.onTimezoneChange?.(timezone);
    datePickerProps?.onDateChange?.(updatedDateTime.format(datePickerProps.dateFormat));
    onChange?.(updatedDateTime);
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
            value={dateMoment.format(`${datePickerProps.dateFormat} ${timePickerProps.timeFormat}`)}
            onChange={handleDateChange('scheduledDate')}
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
            disablePast={datePickerProps.disablePast}
            error={!pickerState.dateValid}
            helperText={pickerState.dateValid ? '' : formatMessage(translations.dateInvalidMessage)}
            labelFunc={(date, invalidLabel) => {
              return invalidLabel || new Intl.DateTimeFormat(localeCode ?? 'en-US').format(date);
            }}
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
            value={timeMoment.format(`${datePickerProps.dateFormat} ${timePickerProps.timeFormat}`)}
            onChange={handleDateChange('scheduledTime')}
            keyboardIcon={<AccessTimeIcon />}
            className={classes.picker}
            InputAdornmentProps={{
              className: classes.pickerButton
            }}
            inputProps={{
              className: classes.pickerInput
            }}
            placeholder={formatMessage(translations.timePlaceholder)}
            disabled={disabled}
            error={!pickerState.timeValid}
            helperText={pickerState.timeValid ? '' : formatMessage(translations.timeInvalidMessage)}
          />
        )}
      </MuiPickersUtilsProvider>

      {controls.includes('timezone') && (
        <Autocomplete
          options={timezones}
          getOptionLabel={(timezone: timezoneType) => `${timezone.timezoneName} (GMT${timezone.timezoneOffset})`}
          defaultValue={timezoneObj}
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
