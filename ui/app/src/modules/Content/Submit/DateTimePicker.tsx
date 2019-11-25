import React, { useEffect, useState } from 'react';
import moment from 'moment-timezone';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
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

}

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

function DateTimePicker(props: DateTimePickerProps) {
  const { inputs, setInputs } = props;
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
          label="Date"
          value={selectedDateTime}
          onChange={handleDateChange('scheduledDate')}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <KeyboardTimePicker
          margin="normal"
          id="time-picker"
          label="Time"
          value={selectedDateTime}
          onChange={handleDateChange('scheduledTime')}
          InputLabelProps={{
            shrink: true,
          }}
          keyboardIcon={<AccessTimeIcon />}
        />
      </MuiPickersUtilsProvider>
      <Select
          fullWidth
          value={inputs.scheduledTimeZone}
          onChange={handleSelectChange('scheduledTimeZone')}
        >
          { timezones &&
            timezones.map((timezone: any) =>
              <MenuItem key={timezone.timezoneName} value={timezone.timezoneName}>{timezone.timezoneName} (GMT{timezone.timezoneOffset})</MenuItem>
            )
          }
        </Select>
    </>
  )
}

export default DateTimePicker;
