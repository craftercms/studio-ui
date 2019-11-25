import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment-timezone';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import PublicIcon from '@material-ui/icons/Public';
import DateFnsUtils from '@date-io/date-fns';
import 'date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

// TODO: this component will be moved to another folder
// and will also have different props to make it more generic
interface DateTimePickerProps {
  inputs: any;
  setInputs(state: any): any;
  classes?: any;
}

const dateTimePickerStyles = () => ({
  root: {
    width: 'auto'
  },
  picker: {
    width: '100%'
  },
  pickerInput: {
    padding: '8px 12px'
  },
  pickerButton: {
    position: 'absolute' as 'absolute',
    right: 0
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px'
  },
  selectIcon: {
    right: '12px'
  }
});

const timezones = [
  {
    timezoneName: 'Africa/Asmera',
    timezoneOffset: "+03:00"
  },
  {
    timezoneName: 'America/Costa_Rica',
    timezoneOffset: "-06:00"
  },
  {
    timezoneName: 'America/Los_Angeles',
    timezoneOffset: "-08:00"
  }
]

const DateTimePicker = withStyles(dateTimePickerStyles)((props: DateTimePickerProps) => {
  const { inputs, setInputs, classes } = props;
  const [ selectedDateTime, setSelectedDateTime ] = useState(moment());

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
    setInputs({ ...inputs, "scheduledDateTime": selectedDateTime });
  };

  const handleSelectChange = (name: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    const timezone = event.target.value;
    setInputs({ ...inputs, [name]: timezone });

    const updatedDateTime = moment.tz(selectedDateTime.format(), 'YYYY-MM-DD HH:mm A', timezone);
    setSelectedDateTime(updatedDateTime);
  };

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker"
          value={selectedDateTime}
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
        <KeyboardTimePicker
          margin="normal"
          id="time-picker"
          value={selectedDateTime}
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
      </MuiPickersUtilsProvider>
      <Select
          fullWidth
          value={inputs.scheduledTimeZone}
          inputProps={{
            className: classes.select
          }}
          onChange={handleSelectChange('scheduledTimeZone')}
          IconComponent={ PublicIcon }
          classes={{
            icon: classes.selectIcon
          }}
        >
          { timezones &&
            timezones.map((timezone: any) =>
              <MenuItem key={timezone.timezoneName} value={timezone.timezoneName}>{timezone.timezoneName} (GMT{timezone.timezoneOffset})</MenuItem>
            )
          }
        </Select>
    </>
  )
});

export default DateTimePicker;
