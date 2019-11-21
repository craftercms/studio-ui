import React, { useEffect, useState } from 'react';
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
    timezoneOffset: 3
  },
  {
    timezoneName: 'America/Costa_Rica',
    timezoneOffset: -6
  },
  {
    timezoneName: 'America/Los_Angeles',
    timezoneOffset: -8
  }
]

function DateTimePicker(props: DateTimePickerProps) {
  const { inputs, setInputs } = props;
  const [ selectedDateTime, setSelectedDateTime ] = useState(new Date());

  const handleDateChange = (name: string) => (date: Date | null) => {
    var updatedDateTime = selectedDateTime;
    switch (name) {
      case 'scheduledDate':
        updatedDateTime.setDate(date.getDate());
        updatedDateTime.setMonth(date.getMonth());
        updatedDateTime.setFullYear(date.getFullYear());
        break;
      case 'scheduledTime':
        updatedDateTime.setHours(date.getHours());
        updatedDateTime.setMinutes(date.getMinutes());
        break;
    }

    setSelectedDateTime(updatedDateTime);

    setInputs({ ...inputs, "scheduledDateTime": selectedDateTime });
  };

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="Date picker inline"
          value={selectedDateTime}
          onChange={handleDateChange('scheduledDate')}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        <KeyboardTimePicker
          margin="normal"
          id="time-picker"
          label="Time picker"
          value={selectedDateTime}
          onChange={handleDateChange('scheduledTime')}
          KeyboardButtonProps={{
            'aria-label': 'change time',
          }}
          keyboardIcon={<AccessTimeIcon />}
        />
      </MuiPickersUtilsProvider>
      <Select
          fullWidth
          value={inputs.environment}
          // onChange={handleSelectChange('environment')}
        >
          { timezones &&
            timezones.map((timezone: any) =>
              <MenuItem key={timezone.timezoneName} value={timezone.timezoneOffset}>{timezone.timezoneName}</MenuItem>
            )
          }
        </Select>
    </>
  )
}

export default DateTimePicker;
