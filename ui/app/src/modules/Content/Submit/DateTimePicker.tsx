import React, { useEffect, useState } from 'react';
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

function DateTimePicker(props: DateTimePickerProps) {
  const { inputs, setInputs } = props;

  const handleDateChange = (name: string) => (date: Date | null) => {
    setInputs({ ...inputs, [name]: date });
  };

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="Date picker inline"
          value={inputs.scheduledDate}
          onChange={handleDateChange('scheduledDate')}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        <KeyboardTimePicker
          margin="normal"
          id="time-picker"
          label="Time picker"
          value={inputs.scheduledTime}
          onChange={handleDateChange('scheduledTime')}
          KeyboardButtonProps={{
            'aria-label': 'change time',
          }}
          keyboardIcon={<AccessTimeIcon />}
        />
      </MuiPickersUtilsProvider>
    </>
  )
}

export default DateTimePicker;
