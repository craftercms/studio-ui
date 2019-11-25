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
interface DateTimePickerProps {
  onChange?: any;
  onChangeDate?: any;
  onChangeTime?: any;
  onChangeTimezone?: any;
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
    padding: '8px 12px'
  },
  pickerButton: {
    position: 'absolute' as 'absolute',
    right: 0
  },
  select: {
    padding: '8px 12px',
    borderRadius: '4px',
    marginTop: '16px',
    position: 'relative' as 'relative'
  },
  selectIcon: {
    right: '12px',
    top: '20px'
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
  const {
    classes,
    onChange,
    onChangeDate,
    onChangeTime,
    onChangeTimezone,
    initialDate,
    timezone,
    controls
  } = props;
  const [ selectedDateTime, setSelectedDateTime ] = useState(initialDate ? initialDate : moment());
  const [ selectedTimezone, setSelectedTimezone ] = useState(timezone ? timezone : moment.tz.guess());
  const showAll = !controls;

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

  const handleSelectChange = () => (event: React.ChangeEvent<{ value: unknown }>) => {
    const timezone = event.target.value,
          updatedDateTime = moment.tz(selectedDateTime.format(), 'YYYY-MM-DD HH:mm A', timezone);
    setSelectedDateTime(updatedDateTime);
    setSelectedTimezone(timezone);

    onChange && onChange(updatedDateTime);
    onChangeTimezone && onChangeTimezone(timezone);
  };

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        { (controls && controls.includes('date') || showAll) &&
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

        { (controls && controls.includes('time') || showAll) &&
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

      { (controls && controls.includes('timezone') || showAll) &&
        <Select
          fullWidth
          value={selectedTimezone}
          inputProps={{
            className: classes.select
          }}
          onChange={handleSelectChange()}
          IconComponent={ PublicIcon }
          classes={{
            icon: classes.selectIcon
          }}
        >
          { timezones &&
            timezones.map((timezone: any) =>
              <MenuItem key={timezone.timezoneName} value={timezone.timezoneName}>
                {timezone.timezoneName} (GMT{timezone.timezoneOffset})
              </MenuItem>
            )
          }
        </Select>
      }
    </>
  )
});

export default DateTimePicker;
