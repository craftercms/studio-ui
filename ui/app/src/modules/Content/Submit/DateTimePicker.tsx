import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment-timezone';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import PublicIcon from '@material-ui/icons/Public';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
/* eslint-disable no-use-before-define */
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getTimezones } from "../../../utils/timezones";

// TODO: this component will be moved to another folder
interface DateTimePickerProps {
  onChange?: Function;
  onChangeDate?: Function;
  onChangeTime?: Function;
  onChangeTimezone?: Function;
  format?: string;
  initialDate?: string | moment.Moment;
  timezone?: string;
  classes?: any;
  controls?: string[];    // options: ['date', 'time', 'timezone'], ['date', 'time'], ['date']
}

// TODO:
// format as prop
// initial date as prop -> strings|milliseconds
// only dates|times|timezone|all|etc -> props

const dateTimePickerStyles = () => ({
  root: {
    width: 'auto'
  },
  picker: {
    width: '100%',
    marginBottom: 0
  },
  pickerInput: {
    padding: '8px 12px',
    backgroundColor: '#fff',
    fontSize: '14px'
  },
  pickerButton: {
    position: 'absolute' as 'absolute',
    right: 0
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    marginTop: '16px',
    position: 'relative' as 'relative',
    backgroundColor: '#fff',
    fontSize: '14px'
  },
  selectIcon: {
    right: '12px',
    top: '22px'
  },
  autocompleteRoot: {
    marginTop: '16px',
    backgroundColor: '#fff'
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
});

interface timezoneType {
  timezoneName: string;
  timezoneOffset: string;
}

const timezones = getTimezones();

const DateTimePicker = withStyles(dateTimePickerStyles)((props: DateTimePickerProps) => {
  const {
    classes,
    onChange,
    onChangeDate,
    onChangeTime,
    onChangeTimezone,
    initialDate = moment(),
    timezone = moment.tz.guess(),
    controls = ['date', 'time', 'timezone']
  } = props;

  const timezoneObj = timezones.find( tz => (tz.timezoneName === timezone) );
  const [ selectedDateTime, setSelectedDateTime ] = useState(initialDate);
  const [ selectedTimezone, setSelectedTimezone ] = useState(timezoneObj);

  const handleDateChange = (name: string) => (date: Date | null) => {
    let updatedDateTime = selectedDateTime;

    switch (name) {
      case 'scheduledDate':
        updatedDateTime.date(date.getDate());
        updatedDateTime.month(date.getMonth());
        updatedDateTime.year(date.getFullYear());
        break;
      case 'scheduledTime':
        updatedDateTime.hours(date.getHours());
        updatedDateTime.minutes(date.getMinutes());
        break;
    }

    setSelectedDateTime(updatedDateTime);

    onChange && onChange(updatedDateTime);
  };

  const handleTimezoneChange = () => (event: React.ChangeEvent<{}>, timezoneObj: any) => {
    const timezone = timezoneObj.timezoneName,
          updatedDateTime = moment.tz(selectedDateTime.format(), 'YYYY-MM-DD HH:mm A', timezone);
    setSelectedDateTime(updatedDateTime);
    setSelectedTimezone(timezoneObj);

    onChange && onChange(updatedDateTime);
    onChangeTimezone && onChangeTimezone(timezoneObj);
  };

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        { controls.includes('date') &&
          <KeyboardDatePicker
            format="MM/dd/yyyy"
            margin="normal"
            id="date-picker"
            value={selectedDateTime.format('YYYY-MM-DD HH:mm')}
            onChange={handleDateChange('scheduledDate')}
            className={classes.picker}
            InputAdornmentProps={{
              className: classes.pickerButton
            }}
            inputProps={{
              className: classes.pickerInput
            }}
            placeholder="Date"
          />
        }

        { controls.includes('time') &&
          <KeyboardTimePicker
            margin="normal"
            id="time-picker"
            value={selectedDateTime.format('YYYY-MM-DD HH:mm')}
            onChange={handleDateChange('scheduledTime')}
            keyboardIcon={<AccessTimeIcon />}
            className={classes.picker}
            InputAdornmentProps={{
              className: classes.pickerButton
            }}
            inputProps={{
              className: classes.pickerInput
            }}
            placeholder="Time"
          />
        }
      </MuiPickersUtilsProvider>

      {
        controls.includes('timezone') &&
        <Autocomplete
          options={timezones}
          getOptionLabel={(timezone: timezoneType) => ( `${timezone.timezoneName} (GMT${timezone.timezoneOffset})` )}
          defaultValue={selectedTimezone}
          onChange={handleTimezoneChange()}
          size="small"
          classes={{
            root: classes.autocompleteRoot,
            inputRoot: classes.autocompleteInputRoot,
            input: classes.autocompleteInput,
            endAdornment: classes.autocompleteEndAdornment
          }}
          popupIcon={ <PublicIcon/> }
          disableClearable={true}
          renderInput={params => (
            <TextField {...params} variant="outlined" fullWidth />
          )}
        />
      }
    </>
  )
});

export default DateTimePicker;
