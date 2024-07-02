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

CStudioForms.Controls.Time =
  CStudioForms.Controls.Time ||
  function (id, form, owner, properties, constraints, readonly) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.dateEl = null;
    this.required = false;
    this.value = '_not-set';
    this.form = form;
    this.id = id;
    this.hour12 = CrafterCMSNext.system.store.getState().uiConfig.locale.dateTimeFormatOptions?.hour12 ?? true;
    this.timezoneId = this.id + '_tz';
    this.readonly = readonly;
    this.showClear = false;
    this.showNowLink = false;
    this.populate = false;
    this.timezone = '';
    this.useCustomTimezone = false;
    this.startDateTimeObj = null; // Object storing the time when the form was loaded; will be used to adjust startTzDateTimeStr before the form is saved
    this.startTzDateTimeStr = null; // Time the form was loaded (adjusted to the site's timezone)
    this.populateDateExp = 'now';
    // This value is used when no custom timezone is selected for the control, the defaultTimezone is used for the timezone
    // this will actually get stored, defaults to user timezone.
    this.displayTimezone = craftercms.utils.datetime.getUserTimeZone();
    this.defaultTimezone = craftercms.utils.datetime.getUserTimeZone();
    this.defaultTimezones = [
      { key: 'Etc/GMT+12', value: '(GMT-12:00) International Date Line West' },
      { key: 'Etc/GMT+11', value: '(GMT-11:00) Coordinated Universal Time-11' },
      { key: 'Pacific/Honolulu', value: '(GMT-10:00) Hawaii' },
      { key: 'America/Anchorage', value: '(GMT-09:00) Alaska' },
      { key: 'America/Tijuana', value: '(GMT-08:00) Baja California' },
      { key: 'America/Los_Angeles', value: '(GMT-08:00) Pacific Time (US & Canada)' },
      { key: 'America/Phoenix', value: '(GMT-07:00) Arizona' },
      { key: 'America/Chihuahua', value: '(GMT-07:00) Chihuahua, La Paz, Mazatlan' },
      { key: 'America/Denver', value: '(GMT-07:00) Mountain Time (US & Canada)' },
      { key: 'America/Guatemala', value: '(GMT-06:00) Central America' },
      { key: 'America/Chicago', value: '(GMT-06:00) Central Time (US & Canada)' },
      { key: 'America/Mexico_City', value: '(GMT-06:00) Guadalajara, Mexico City, Monterrey' },
      { key: 'America/Regina', value: '(GMT-06:00) Saskatchewan' },
      { key: 'America/Bogota', value: '(GMT-05:00) Bogota, Lima, Quito' },
      { key: 'America/New_York', value: '(GMT-05:00) Eastern Time (US & Canada)' },
      { key: 'America/Indianapolis', value: '(GMT-05:00) Indiana (East)' },
      { key: 'America/Caracas', value: '(GMT-04:30) Caracas' },
      { key: 'America/Asuncion', value: '(GMT-04:00) Asuncion' },
      { key: 'America/Halifax', value: '(GMT-04:00) Atlantic Time (Canada)' },
      { key: 'America/Cuiaba', value: '(GMT-04:00) Cuiaba' },
      { key: 'America/La_Paz', value: '(GMT-04:00) Georgetown, La Paz, Manaus, San Juan' },
      { key: 'America/Santiago', value: '(GMT-04:00) Santiago' },
      { key: 'America/St_Johns', value: '(GMT-03:30) Newfoundland' },
      { key: 'America/Sao_Paulo', value: '(GMT-03:00) Brasilia' },
      { key: 'America/Buenos_Aires', value: '(GMT-03:00) Buenos Aires' },
      { key: 'America/Cayenne', value: '(GMT-03:00) Cayenne, Fortaleza' },
      { key: 'America/Godthab', value: '(GMT-03:00) Greenland' },
      { key: 'America/Montevideo', value: '(GMT-03:00) Montevideo' },
      { key: 'Etc/GMT+2', value: '(GMT-02:00) Coordinated Universal Time-02' },
      { key: 'Etc/GMT+2', value: '(GMT-02:00) Mid-Atlantic' },
      { key: 'Atlantic/Azores', value: '(GMT-01:00) Azores' },
      { key: 'Atlantic/Cape_Verde', value: '(GMT-01:00) Cape Verde Is.' },
      { key: 'Africa/Casablanca', value: '(GMT) Casablanca' },
      { key: 'Etc/GMT', value: '(GMT) Coordinated Universal Time' },
      { key: 'Europe/London', value: '(GMT) Dublin, Edinburgh, Lisbon, London' },
      { key: 'Atlantic/Reykjavik', value: '(GMT) Monrovia, Reykjavik' },
      {
        key: 'Europe/Berlin',
        value: '(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'
      },
      {
        key: 'Europe/Budapest',
        value: '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague'
      },
      { key: 'Europe/Paris', value: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris' },
      { key: 'Europe/Warsaw', value: '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb' },
      { key: 'Africa/Lagos', value: '(GMT+01:00) West Central Africa' },
      { key: 'Africa/Windhoek', value: '(GMT+02:00) Windhoek' },
      { key: 'Asia/Amman', value: '(GMT+02:00) Amman' },
      { key: 'Europe/Istanbul', value: '(GMT+02:00) Athens, Bucharest, Istanbul' },
      { key: 'Asia/Beirut', value: '(GMT+02:00) Beirut' },
      { key: 'Africa/Cairo', value: '(GMT+02:00) Cairo' },
      { key: 'Asia/Damascus', value: '(GMT+02:00) Damascus' },
      { key: 'Africa/Johannesburg', value: '(GMT+02:00) Harare, Pretoria' },
      { key: 'Europe/Kiev', value: '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius' },
      { key: 'Asia/Jerusalem', value: '(GMT+02:00) Jerusalem' },
      { key: 'Europe/Minsk', value: '(GMT+02:00) Minsk' },
      { key: 'Asia/Baghdad', value: '(GMT+03:00) Baghdad' },
      { key: 'Asia/Riyadh', value: '(GMT+03:00) Kuwait, Riyadh' },
      { key: 'Africa/Nairobi', value: '(GMT+03:00) Nairobi' },
      { key: 'Asia/Tehran', value: '(GMT+03:30) Tehran' },
      { key: 'Europe/Moscow', value: '(GMT+03:00) Moscow, St. Petersburg, Volgograd' },
      { key: 'Asia/Dubai', value: '(GMT+04:00) Abu Dhabi, Muscat' },
      { key: 'Asia/Baku', value: '(GMT+04:00) Baku' },
      { key: 'Indian/Mauritius', value: '(GMT+04:00) Port Louis' },
      { key: 'Asia/Tbilisi', value: '(GMT+04:00) Tbilisi' },
      { key: 'Asia/Yerevan', value: '(GMT+04:00) Yerevan' },
      { key: 'Asia/Kabul', value: '(GMT+04:30) Kabul' },
      { key: 'Asia/Karachi', value: '(GMT+05:00) Islamabad, Karachi' },
      { key: 'Asia/Tashkent', value: '(GMT+05:00) Tashkent' },
      { key: 'Asia/Calcutta', value: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
      { key: 'Asia/Colombo', value: '(GMT+05:30) Sri Jayawardenepura' },
      { key: 'Asia/Katmandu', value: '(GMT+05:45) Kathmandu' },
      { key: 'Asia/Yekaterinburg', value: '(GMT+05:00) Ekaterinburg' },
      { key: 'Asia/Almaty', value: '(GMT+06:00) Astana' },
      { key: 'Asia/Dhaka', value: '(GMT+06:00) Dhaka' },
      { key: 'Asia/Rangoon', value: '(GMT+06:30) Yangon (Rangoon)' },
      { key: 'Asia/Novosibirsk', value: '(GMT+06:00) Novosibirsk' },
      { key: 'Asia/Bangkok', value: '(GMT+07:00) Bangkok, Hanoi, Jakarta' },
      { key: 'Asia/Krasnoyarsk', value: '(GMT+07:00) Krasnoyarsk' },
      { key: 'Asia/Shanghai', value: '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi' },
      { key: 'Asia/Singapore', value: '(GMT+08:00) Kuala Lumpur, Singapore' },
      { key: 'Australia/Perth', value: '(GMT+08:00) Perth' },
      { key: 'Asia/Taipei', value: '(GMT+08:00) Taipei' },
      { key: 'Asia/Ulaanbaatar', value: '(GMT+08:00) Ulaanbaatar' },
      { key: 'Asia/Irkutsk', value: '(GMT+08:00) Irkutsk' },
      { key: 'Asia/Tokyo', value: '(GMT+09:00) Osaka, Sapporo, Tokyo' },
      { key: 'Asia/Seoul', value: '(GMT+09:00) Seoul' },
      { key: 'Australia/Adelaide', value: '(GMT+09:30) Adelaide' },
      { key: 'Australia/Darwin', value: '(GMT+09:30) Darwin' },
      { key: 'Asia/Yakutsk', value: '(GMT+09:00) Yakutsk' },
      { key: 'Australia/Brisbane', value: '(GMT+10:00) Brisbane' },
      { key: 'Australia/Sydney', value: '(GMT+10:00) Canberra, Melbourne, Sydney' },
      { key: 'Pacific/Port_Moresby', value: '(GMT+10:00) Guam, Port Moresby' },
      { key: 'Australia/Hobart', value: '(GMT+10:00) Hobart' },
      { key: 'Asia/Vladivostok', value: '(GMT+10:00) Vladivostok' },
      { key: 'Pacific/Guadalcanal', value: '(GMT+11:00) Solomon Is., New Caledonia' },
      { key: 'Asia/Magadan', value: '(GMT+11:00) Magadan' },
      { key: 'Pacific/Auckland', value: '(GMT+12:00) Auckland, Wellington' },
      { key: 'Etc/GMT-12', value: '(GMT+12:00) Coordinated Universal Time+12' },
      { key: 'Pacific/Fiji', value: '(GMT+12:00) Fiji, Marshall Is.' },
      { key: 'Asia/Kamchatka', value: '(GMT+12:00) Petropavlovsk-Kamchatsky - Old' },
      { key: 'Pacific/Tongatapu', value: "(GMT+13:00) Nuku'alofa" },
      { key: 'Pacific/Apia', value: '(GMT-11:00) Samoa' }
    ];
    this.timezones = this.defaultTimezones;
    this.supportedPostFixes = ['_to'];

    return this;
  };

YAHOO.extend(CStudioForms.Controls.Time, CStudioForms.CStudioFormField, {
  getAdditionalFields: function () {
    return [this.timezoneId];
  },

  formatTime: function (time) {
    const timeMomentObj = moment(time, 'hh:mm:ss a'); // Format used by control
    const format = this.hour12 ? 'hh:mm:ss a' : 'HH:mm:ss';

    return timeMomentObj.format(format);
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'time');
  },

  validate: function (evt, obj) {
    var timeValue = obj.timeEl.dataset.value,
      valid;

    if (obj.required) {
      if (timeValue == '') {
        obj.setError('required', 'Field is Required');
        obj.renderValidation(true);
        valid = false;
      } else {
        obj.clearError('required');
        obj.renderValidation(true);
        valid = true;
      }
    } else {
      valid = true;
    }
    return valid;
  },

  _onChange: function (evt, obj) {
    obj.updateTime();
  },

  _onChangeVal: function (evt, obj) {
    obj.edited = true;
    if (obj._onChange) {
      obj._onChange(evt, obj);
    }
  },

  // Get the UTC date representation for what is currently in the UI fields (date/time)
  // Returns a date/time value in a string (see getConvertFormat for value format)
  getFieldValue: function () {
    var dateValue = new Date();
    var day = dateValue.getDate();
    var monthIndex = dateValue.getMonth() + 1;
    var year = dateValue.getFullYear();
    var dateVal = monthIndex + '/' + day + '/' + year;
    var timeValue = this.timeEl.dataset.value,
      timeVal,
      res;

    if (this.validate(null, this)) {
      const timeValueExists = Boolean(timeValue);
      if (timeValueExists) {
        var timeVals = timeValue.split(' ');
        var isPm = timeVals[1] == 'pm' ? true : false;
        var timeFields = timeVals[0].split(':');
        var hh = parseInt(timeFields[0], 10);
        var mi = timeFields[1];
        var ss = timeFields[2];
        hh = isPm && hh != 12 ? hh + 12 : !isPm && hh == 12 ? 0 : hh;
        var hpad = hh < 10 ? '0' : '';
        timeVal = hpad + hh + ':' + mi + ':' + ss;
      } else {
        timeVal = ''; // Default time value if the user doesn't populate the time field
      }

      if (timeValueExists) {
        // Current displayed timezone: if using customTimezone it used the selected one (this.timezone). If not using
        // customTimezone it uses the displayTimezone.
        // This section converts the current displayed timezone back to UTC (to store in xml).
        const sourceTimezone = this.useCustomTimezone ? this.timezone : this.displayTimezone;
        res = this.convertDateTime(dateVal, timeValue, sourceTimezone, true, null).split(' ');
        return res[1];
      } else {
        return ''; // The date/time fields are empty
      }
    }
    // If the form doesn't validate, it should trigger errors when the fields are blurred so
    // in theory, it should never reach this point (because this function -getFieldValue- should be called on beforeSave).
    return false;
  },

  // Get a date/time string to use with the time converting service
  getDateTimeString: function (date, time) {
    // There should always be a time value or else, we risk calculating the date value incorrectly; but, just in case ...
    var dateTimeStr = date ? date + (time ? ' ' + time : ' 00:00:00') : '' + time;
    return dateTimeStr;
  },

  // TO-DO: improvement
  // Currently this is making a synchronous call to get the UTC representation of a date. The size of the transfer of
  // information made through this call is small so it shouldn't affect UX considerably. This call is synchronous because
  // we want to store the UTC representation of a date before the form closes. The form engine offers the possibility to
  // register "beforeSave" callbacks, but these are assumed to be synchronous (forms-engine.js, onBeforeSave method)

  convertDateTime: function (date, time, newTimeZone, toUTC, callback) {
    var convertString = this.getDateTimeString(date, time.replace(/\./g, ''));
    var newDate;

    if (!toUTC) {
      var utcDate = moment.tz(convertString, 'Etc/UTC'),
        newDate = utcDate.tz(newTimeZone ? newTimeZone : 'EST5EDT').format('MM/DD/YYYY HH:mm:ss');
      newDate = newDate !== 'Invalid date' ? newDate : '';
    } else {
      newDate = CStudioAuthoring.Utils.parseDateToUTC(convertString, newTimeZone, 'large', 'MM/DD/YYYY hh:mm:ss a');
    }

    if (callback) {
      callback.success(newDate);
    } else {
      return newDate;
    }
  },

  // set the timestamp and format for the output
  setTimeStamp: function (timeStamp, timeFormat) {
    return (
      this._padAZero(timeStamp.getHours()) +
      ':' +
      this._padAZero(timeStamp.getMinutes()) +
      ':' +
      this._padAZero(timeStamp.getSeconds()) +
      ' ' +
      timeFormat
    );
  },

  updateTime: function (evt, param) {
    // patterns to match the time format
    var timeParsePatterns = [
      // Now
      {
        re: /^now/i,
        example: new Array('now'),
        handler: function () {
          return new Date();
        }
      },
      // p.m.
      {
        re: /(\d{1,2}):(\d{1,2}):(\d{1,2})(?:p| p)/,
        example: new Array('9:55:00 pm', '12:55:00 pm', '9:55:00 p', '11:5:10pm', '9:5:1p'),
        handler: function (bits) {
          var d = new Date();
          var h = parseInt(bits[1], 10);
          d.setHours(h);
          d.setMinutes(parseInt(bits[2], 10));
          d.setSeconds(parseInt(bits[3], 10));
          return d + '~pm';
        }
      },
      // p.m., no seconds
      {
        re: /(\d{1,2}):(\d{1,2})(?:p| p)/,
        example: new Array('9:55 pm', '12:55 pm', '9:55 p', '11:5pm', '9:5p'),
        handler: function (bits) {
          var d = new Date();
          var h = parseInt(bits[1], 10);
          d.setHours(h);
          d.setMinutes(parseInt(bits[2], 10));
          d.setSeconds(0);
          return d + '~pm';
        }
      },
      // p.m., hour only
      {
        re: /(\d{1,2})(?:p| p)/,
        example: new Array('9 pm', '12 pm', '9 p', '11pm', '9p'),
        handler: function (bits) {
          var d = new Date();
          var h = parseInt(bits[1], 10);
          d.setHours(h);
          d.setMinutes(0);
          d.setSeconds(0);
          return d + '~pm';
        }
      },
      // hh:mm:ss
      {
        re: /(\d{1,2}):(\d{1,2}):(\d{1,2})/,
        example: new Array('9:55:00', '19:55:00', '19:5:10', '9:5:1', '9:55:00 am', '11:55:00a'),
        handler: function (bits) {
          var d = new Date();
          var h = parseInt(bits[1], 10);
          d.setHours(h);
          d.setMinutes(parseInt(bits[2], 10));
          d.setSeconds(parseInt(bits[3], 10));
          return d + '~am';
        }
      },
      // hh:mm
      {
        re: /(\d{1,2}):(\d{1,2})/,
        example: new Array('9:55', '19:55', '19:5', '9:55 am', '11:55a'),
        handler: function (bits) {
          var d = new Date();
          var h = parseInt(bits[1], 10);
          d.setHours(h);
          d.setMinutes(parseInt(bits[2], 10));
          d.setSeconds(0);
          return d + '~am';
        }
      },
      // hhmmss
      {
        re: /(\d{1,6})/,
        example: new Array('9', '9a', '9am', '19', '1950', '195510', '0955'),
        handler: function (bits) {
          var d = new Date();
          var h = bits[1].substring(0, 2);
          var m = parseInt(bits[1].substring(2, 4), 10);
          var s = parseInt(bits[1].substring(4, 6), 10);
          if (isNaN(m)) {
            m = 0;
          }
          if (isNaN(s)) {
            s = 0;
          }
          d.setHours(parseInt(h, 10));
          d.setMinutes(parseInt(m, 10));
          d.setSeconds(parseInt(s, 10));
          return d + '~am';
        }
      }
    ];

    // Parses a string to figure out the time it represents
    function parseTimeString(s) {
      for (var i = 0; i < timeParsePatterns.length; i++) {
        var re = timeParsePatterns[i].re;
        var handler = timeParsePatterns[i].handler;
        var bits = re.exec(s);
        if (bits) {
          return handler(bits);
        }
      }
    }

    let formattedValue;
    if (!this.hour12) {
      const timeMomentObj = moment(this.timeEl.value, 'HH:mm:ss');
      formattedValue = timeMomentObj.format('hh:mm:ss a');
    } else {
      formattedValue = this.timeEl.value;
    }

    this.timeEl.dataset.value = formattedValue;

    // parse the value using patterns and retrive the date with format
    var inputTime = parseTimeString(this.timeEl.dataset.value);

    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
    var self_ = this;

    if (inputTime == undefined) {
      if (this.timeEl.dataset.value != '') {
        CStudioAuthoring.Operations.showSimpleDialog(
          'timeFormatError-dialog',
          CStudioAuthoring.Operations.simpleDialogTypeINFO,
          CMgs.format(langBundle, 'notification'),
          '( ' + this.timeEl.value + ' ) ' + CMgs.format(langBundle, 'invalidFormat'),
          [
            {
              text: 'OK',
              handler: function () {
                this.hide();
                self_.timeEl.value = '';
                self_.timeEl.dataset.value = '';
                self_.setDateTime('');
                return;
              },
              isDefault: false
            }
          ],
          YAHOO.widget.SimpleDialog.ICON_BLOCK,
          'studioDialog'
        );
      }
    } else {
      var finalTimeFormat = inputTime.split('~');
      var timeStamp = this.setTimeStamp.call(this, new Date(finalTimeFormat[0]), finalTimeFormat[1]);
      // Check for 12 hours format time
      var timeSplit = timeStamp.split(':');
      if (timeSplit.length == 3) {
        var hours = parseInt(timeSplit[0], 10);
        if (hours == 0 || hours > 12) {
          CStudioAuthoring.Operations.showSimpleDialog(
            'timeFormatError-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            CMgs.format(langBundle, 'notification'),
            '( ' + this.timeEl.value + ' ) ' + CMgs.format(langBundle, 'invalidFormat'),
            [
              {
                text: 'OK',
                handler: function () {
                  this.hide();
                  self_.timeEl.focus();
                  self_.setDateTime('');
                  return;
                },
                isDefault: false
              }
            ],
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog'
          );
        }
      }
      // set the value
      this.timeEl.value = this.formatTime(timeStamp);
      this.timeEl.dataset.value = timeStamp;
      this.setDateTime(timeStamp);
    }
  },

  /**
   * padd a zero if single digit found
   */
  _padAZero: function (s) {
    s = s.toString();
    return s.length == 1 ? '0' + s : s;
  },

  /**
   * create timepicker increment and decrement helper
   * that increse the input time
   */

  textFieldTimeIncrementHelper: function (triggerEl, targetEl, event, keyCode) {
    var self = this;

    var incrementHandler = function (type, args) {
      var timePicker = YDom.get(targetEl),
        timeValue = timePicker.dataset.value,
        cursorPosition;

      if (timeValue != 'Time...' && timeValue != '') {
        var timeValueArray = timeValue.split(/[: ]/),
          hourValue = timeValueArray[0],
          minuteValue = timeValueArray[1],
          secondValue = timeValueArray[2],
          amPmValue = timeValueArray[3];

        cursorPosition = timePicker.getAttribute('data-cursor');

        if (cursorPosition > -1 && cursorPosition < 3) {
          if (hourValue.charAt(0) == '0') hourValue = hourValue.charAt(1);

          hourValue = (parseInt(hourValue, 10) % 12) + 1;

          if (hourValue.toString().length < 2) hourValue = '0' + hourValue;
          else hourValue = hourValue.toString();
        } else if (cursorPosition > 2 && cursorPosition < 6) {
          if (minuteValue.charAt(0) == '0') minuteValue = minuteValue.charAt(1);

          if (parseInt(minuteValue, 10) == 59) {
            minuteValue = parseInt(minuteValue, 10) % 59;
          } else {
            minuteValue = (parseInt(minuteValue, 10) % 59) + 1;
          }

          if (minuteValue.toString().length < 2) minuteValue = '0' + minuteValue;
          else minuteValue = minuteValue.toString();
        } else if (cursorPosition > 5 && cursorPosition < 9) {
          if (secondValue.charAt(0) == '0') secondValue = secondValue.charAt(1);

          if (parseInt(secondValue, 10) == 59) {
            secondValue = parseInt(secondValue, 10) % 59;
          } else {
            secondValue = (parseInt(secondValue, 10) % 59) + 1;
          }

          if (secondValue.toString().length < 2) secondValue = '0' + secondValue;
          else secondValue = secondValue.toString();
        } else if (cursorPosition > 8) {
          amPmValue = amPmValue == 'am' ? 'pm' : 'am';
        }

        timePicker.value = self.formatTime(hourValue + ':' + minuteValue + ':' + secondValue + ' ' + amPmValue);
        timePicker.dataset.value = hourValue + ':' + minuteValue + ':' + secondValue + ' ' + amPmValue;
        self.updateTime();
      }
    };

    YEvent.addListener(triggerEl, event, incrementHandler);

    if (keyCode) {
      // Add keyboard support, incomplete --CSTUDIO-401
      klInc = new YAHOO.util.KeyListener(targetEl, { keys: keyCode }, incrementHandler);
      klInc.enable();
    }
  },

  /**
   * create timepicker decrement and decrement helper
   * that decrese the input time
   */
  textFieldTimeDecrementHelper: function (triggerEl, targetEl, event, keyCode) {
    var self = this;

    var decrementHandler = function (type, args) {
      var timePicker = YDom.get(targetEl),
        timeValue = timePicker.dataset.value,
        cursorPosition;

      if (timeValue != 'Time...' && timeValue != '') {
        var timeValueArray = timeValue.split(/[: ]/),
          hourValue = timeValueArray[0],
          minuteValue = timeValueArray[1],
          secondValue = timeValueArray[2],
          amPmValue = timeValueArray[3];

        cursorPosition = timePicker.getAttribute('data-cursor');

        if (cursorPosition > -1 && cursorPosition < 3) {
          if (hourValue.charAt(0) == '0') hourValue = hourValue.charAt(1);

          if (parseInt(hourValue, 10) == 1) {
            hourValue = 12;
          } else {
            hourValue = (parseInt(hourValue, 10) - 1) % 12;
          }

          if (hourValue.toString().length < 2) hourValue = '0' + hourValue;
          else hourValue = hourValue.toString();
        } else if (cursorPosition > 2 && cursorPosition < 6) {
          if (minuteValue.charAt(0) == '0') minuteValue = minuteValue.charAt(1);

          if (parseInt(minuteValue, 10) == 0) {
            minuteValue = 59;
          } else {
            minuteValue = (parseInt(minuteValue, 10) - 1) % 59;
          }

          if (minuteValue.toString().length < 2) minuteValue = '0' + minuteValue;
          else minuteValue = minuteValue.toString();
        } else if (cursorPosition > 5 && cursorPosition < 9) {
          if (secondValue.charAt(0) == '0') secondValue = secondValue.charAt(1);

          if (parseInt(secondValue, 10) == 0) {
            secondValue = 59;
          } else {
            secondValue = (parseInt(secondValue, 10) - 1) % 59;
          }

          if (secondValue.toString().length < 2) secondValue = '0' + secondValue;
          else secondValue = secondValue.toString();
        } else if (cursorPosition > 8) {
          if (amPmValue == 'am') amPmValue = 'pm';
          else amPmValue = 'am';
        }

        timePicker.value = self.formatTime(hourValue + ':' + minuteValue + ':' + secondValue + ' ' + amPmValue);
        timePicker.dataset.value = hourValue + ':' + minuteValue + ':' + secondValue + ' ' + amPmValue;
        self.updateTime();
      }
    };

    YEvent.addListener(triggerEl, event, decrementHandler);

    if (keyCode) {
      // Add keyboard support, incomplete --CSTUDIO-401
      klDec = new YAHOO.util.KeyListener(targetEl, { keys: keyCode }, decrementHandler);
      klDec.enable();
    }
  },

  /*
   * Renders a link that serves to populate an input element with a date value
   * @param containerEl : DOM element that will contain the link
   * @param label : Text value of the link
   */
  _renderDateLink: function (containerEl, label) {
    var dl = document.createElement('a');

    dl.setAttribute('alt', '');
    dl.setAttribute('href', '#');
    dl.className = 'date-link btn btn-default btn-sm date-time-picker-date-button';
    dl.innerHTML = label;

    YAHOO.util.Event.on(
      dl,
      'click',
      function (e, context) {
        YAHOO.util.Event.preventDefault(e);
        context.form.setFocusedField(context);

        var _self = this,
          nowObj = new Date(),
          cb;

        cb = {
          success: function (response) {
            var timezoneNow = response;

            timezoneNowObj = _self.getFormattedDateTimeObject(timezoneNow, true);
            _self.populateDateTime(timezoneNowObj, _self.timeEl);
            _self.validate(null, _self, true);
          },
          failure: function (response) {
            console.log('Unable to convert current date/time');
          }
        };
        this.getCurrentDateTime(nowObj, this.timezone, cb);
        this._onChangeVal(null, this);
      },
      this,
      true
    );
    containerEl.appendChild(dl);
  },

  render: function (config, containerEl, lastTwo) {
    // we need to make the general layout of a control inherit from common
    // you should be able to override it -- but most of the time it wil be the same
    containerEl.id = this.id;
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    var beforeSaveCb = {
      beforeSave: function (paramObj) {
        var _self = this.context;
        var val = _self.getFieldValue();
        if (typeof val == 'string') {
          _self.value = val;
          _self.form.updateModel(_self.id, _self.value);
          _self.form.updateModel(_self.timezoneId, _self.timezone);
        } else {
          CStudioAuthoring.Operations.showSimpleDialog(
            'saveDateError-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            CMgs.format(langBundle, 'notification'),
            CMgs.format(langBundle, 'saveDateError'),
            null,
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog'
          );
        }
      },
      context: this
    };
    this.form.registerBeforeSaveCallback(beforeSaveCb);

    for (var i = 0; i < config.properties.length; i++) {
      var prop = config.properties[i];

      if (prop.name == 'showClear' && prop.value == 'true') {
        this.showClear = true;
      }

      if (prop.name == 'showNowLink' && prop.value == 'true') {
        this.showNowLink = true;
      }
      if (prop.name === 'populateDateExp' && prop.value.length > 0) {
        this.populateDateExp = prop.value;
      }

      if (prop.name == 'populate' && prop.value == 'true') {
        this.populate = true;
      }

      if (
        (prop.name == 'readonly' && prop.value == 'true') ||
        (prop.name == 'readonlyEdit' && prop.value == 'true' && window.location.search.indexOf('edit=true') >= 1)
      ) {
        this.readonly = true;
      }

      if (prop.name == 'useCustomTimezone' && prop.value == 'true') {
        this.useCustomTimezone = true;
      }

      this.form.registerDynamicField(this.timezoneId);
    }

    var today = new Date(),
      dd = today.getDate(),
      mm = today.getMonth() + 1,
      yyyy = today.getFullYear();

    var divPrefix = this.id + '-';

    var titleEl = document.createElement('span');

    YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
    titleEl.textContent = config.title;

    var controlWidgetContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'date-time-container');

    if (lastTwo) {
      YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'date-time-container on-top');
    }

    if (this.readonly) {
      YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'read-only');
    }

    var dateElContainer = document.createElement('div');
    var validEl = document.createElement('span');
    YAHOO.util.Dom.addClass(validEl, 'validation-hint');
    YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');
    controlWidgetContainerEl.appendChild(validEl);

    var timeWrapper, timeEl, incrementControlEl, decrementControlEl, timezoneEl;

    timeWrapper = document.createElement('div');
    YAHOO.util.Dom.addClass(timeWrapper, 'time-container');

    timeEl = document.createElement('input');
    timeEl.id = divPrefix + 'timepicker';
    timeEl.className = 'time-control';
    timeEl.setAttribute('data-cursor', 0);
    this.timeEl = timeEl;
    YAHOO.util.Dom.addClass(timeEl, 'datum');
    YAHOO.util.Dom.addClass(timeEl, 'time');

    if (!this.readonly) {
      incrementControlEl = document.createElement('input');
      incrementControlEl.type = 'button';
      incrementControlEl.id = divPrefix + 'timeIncrementButton';
      incrementControlEl.className = 'time-increment';
      YAHOO.util.Event.on(
        incrementControlEl,
        'click',
        function () {
          self.form.setFocusedField(self);
        },
        this
      );

      decrementControlEl = document.createElement('input');
      decrementControlEl.type = 'button';
      decrementControlEl.id = divPrefix + 'timeDecrementButton';
      decrementControlEl.className = 'time-decrement';
      YAHOO.util.Event.on(
        decrementControlEl,
        'click',
        function () {
          self.form.setFocusedField(self);
        },
        this
      );

      timeWrapper.appendChild(incrementControlEl);
      timeWrapper.appendChild(decrementControlEl);
    }

    timeWrapper.appendChild(timeEl);
    controlWidgetContainerEl.appendChild(timeWrapper);

    if (this.readonly) {
      timeEl.disabled = true;
    }

    // Subscriptions
    YAHOO.util.Event.addListener(
      timeEl,
      'click',
      function (e) {
        var caretPos = this.saveCaretPosition(timeEl);
        self.form.setFocusedField(self);
        timeEl.setAttribute('data-cursor', caretPos);
      },
      timeEl,
      this
    );

    YAHOO.util.Event.on(timeEl, 'change', this.updateTime, this, true);

    YAHOO.util.Event.addListener(
      timeEl,
      'keyup',
      function (e) {
        var caretPos = this.saveCaretPosition(timeEl);
        timeEl.setAttribute('data-cursor', caretPos);
      },
      timeEl,
      this
    );

    if (!this.readonly) {
      this.textFieldTimeIncrementHelper(incrementControlEl.id, timeEl.id, 'click');
      this.textFieldTimeDecrementHelper(decrementControlEl.id, timeEl.id, 'click');
    }

    if (this.useCustomTimezone) {
      timezoneEl = document.createElement('select');
      this.addTimezoneOptions(timezoneEl);

      YAHOO.util.Event.addListener(
        timezoneEl,
        'change',
        function (e) {
          var value = this.getFieldValue();

          this.timezone = this.getSelectedTimezone(timezoneEl);
          this._setValue(value, this.timezone);
          this.form.updateModel(this.id, value);
          this.form.updateModel(this.timezoneId, this.timezone);
        },
        timezoneEl,
        this
      );

      timezoneEl.disabled = this.readonly ?? false;
    } else {
      timezoneEl = document.createElement('span');
    }

    timezoneEl.id = divPrefix + 'timezoneCode';
    timezoneEl.className = 'time-zone-picker';
    controlWidgetContainerEl.appendChild(timezoneEl);
    // ---

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    controlsContainer.style.display = 'flex';
    controlWidgetContainerEl.appendChild(controlsContainer);

    if (this.showNowLink && !this.readonly) {
      // only show the link if the field is editable
      this._renderDateLink(controlsContainer, 'Set Now');
    }

    var self = this;
    if (!this.readonly && this.showClear) {
      // Render a link to clear the date and/or time values
      var clearDateEl = document.createElement('a'),
        clearDateLabel = document.createTextNode(CMgs.format(langBundle, 'clearVal'));

      clearDateEl.className = 'clear-link btn btn-default btn-sm date-time-picker-clear-button';
      clearDateEl.href = '#';
      clearDateEl.appendChild(clearDateLabel);

      YAHOO.util.Event.addListener(
        clearDateEl,
        'click',
        function (e) {
          YAHOO.util.Event.preventDefault(e);
          self.form.setFocusedField(self);
          this._onChangeVal(null, this);
          this.setDateTime('');
        },
        clearDateEl,
        this
      );

      controlsContainer.appendChild(clearDateEl);
    }

    this.renderHelp(config, controlWidgetContainerEl);

    var descriptionEl = document.createElement('span');
    YAHOO.util.Dom.addClass(descriptionEl, 'description');
    YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
    descriptionEl.textContent = config.description;

    var calEl = document.createElement('div');
    calEl.id = divPrefix + 'calendarContainer';
    YAHOO.util.Dom.addClass(calEl, 'cstudio-form-field-calendar');
    YAHOO.util.Dom.addClass(calEl, 'hidden');

    dateElContainer.appendChild(calEl);
    containerEl.appendChild(titleEl);
    containerEl.appendChild(controlWidgetContainerEl);
    containerEl.appendChild(descriptionEl);

    const _self = this;
    let store;
    CrafterCMSNext.system.getStore().subscribe((_store_) => {
      store = _store_;
      store.subscribe(() => {
        const locale = store.getState().uiConfig.locale;
        if (_self.locale !== locale) {
          _self.locale = locale;
          _self.hour12 = locale.dateTimeFormatOptions?.hour12 ?? true;

          const value = _self.getFieldValue();
          this._setValue(value, _self.timezone);
        }
      });
    });
  },

  addTimezoneOptions: function (selectEl) {
    for (var i = 0; i < this.timezones.length; i++) {
      var timezone = this.timezones[i];

      var optionEl = document.createElement('option');
      optionEl.setAttribute('value', timezone.key);
      optionEl.appendChild(document.createTextNode(timezone.value));

      selectEl.appendChild(optionEl);
    }
  },

  saveCaretPosition: function (inputEl) {
    var iCaretPos = 0;

    // IE Support
    if (document.selection) {
      inputEl.focus();

      // To get cursor position, get empty selection range
      var oSel = document.selection.createRange();

      // Move selection start to 0 position
      oSel.moveStart('character', -inputEl.value.length);

      // The caret position is selection length
      iCaretPos = oSel.text.length;
    }

    // Firefox/Chrome support
    else if (inputEl.selectionStart || inputEl.selectionStart == '0') iCaretPos = inputEl.selectionStart;

    return iCaretPos;
  },

  getValue: function () {
    return CStudioAuthoring.Utils.formatDateToISO(this.value);
  },

  // check this
  getDateTimeObject: function (timeObj) {
    return {
      date: timeObj.getUTCMonth() + 1 + '/' + timeObj.getUTCDate() + '/' + timeObj.getUTCFullYear(),
      time: timeObj.getUTCHours() + ':' + timeObj.getUTCMinutes() + ':' + timeObj.getUTCSeconds()
    };
  },

  // Parse a date/time string (of the form: "MM/dd/yyyy HH:mm:ss") and return an object with valid date and time values
  getFormattedDateTimeObject: function (datetimeStr, includeDate) {
    var values, timeVals, hh, mi, ss, a, h, hpad, dateObj;

    if (typeof datetimeStr == 'string' && datetimeStr != '') {
      if (includeDate) {
        values = datetimeStr.split(' ');
        timeVals = values[1].split(':');
      } else {
        timeVals = datetimeStr.split(':');
      }
      (hh = parseInt(timeVals[0], 10)),
        (mi = timeVals[1]),
        (ss = timeVals[2]),
        (a = hh < 12 ? 'am' : 'pm'),
        (h = hh > 12 ? hh - 12 : hh == 0 ? 12 : hh),
        (hpad = h < 10 ? '0' : '');

      dateObj = {
        date: includeDate ? values[0] : '',
        time: hpad + h + ':' + mi + ':' + ss + ' ' + a
      };
    } else {
      dateObj = {
        date: '',
        time: ''
      };
    }
    return dateObj;
  },

  displayMessage: function (msgStr, msgType, msgClass) {
    var msgContainer = YAHOO.util.Selector.query('.date-time-container', this.containerEl, true),
      msgExists = YAHOO.util.Selector.query('.' + msgType, msgContainer, true),
      warningEl = document.createElement('div');

    if (msgContainer && !msgExists) {
      warningEl.className = msgClass + ' ' + msgType;
      warningEl.innerHTML = msgStr;
      msgContainer.appendChild(warningEl);
    }
  },

  removeMessage: function (msgType) {
    var msgContainer = YAHOO.util.Selector.query('.date-time-container', this.containerEl, true),
      msgExists = YAHOO.util.Selector.query('.' + msgType, msgContainer, true);

    if (msgContainer && msgExists) {
      msgExists.parentNode.removeChild(msgExists);
    }
  },

  // Populates the date/time fields using the information from a dateObj
  populateDateTime: function (dateObj, timeEl) {
    if (dateObj.time) {
      timeEl.value = this.formatTime(dateObj.time);
      timeEl.dataset.value = dateObj.time;
    } else {
      timeEl.value = this.formatTime(dateObj);
      timeEl.dataset.value = dateObj;
    }
  },

  routeDateTimePopulation: function (value) {
    var _self = this,
      nowObj = this.getDateTimeObject(_self.startDateTimeObj),
      dateVal,
      timeVal,
      emptyDate,
      emptyTime,
      refDateVal,
      refTimeVal,
      dtValues,
      timezoneNowObj,
      cb;

    if (value != '' && value != '_not-set') {
      // If a value already exists for the date/time field, then convert this value (in UTC) to the site's timezone
      cb = {
        success: function (response) {
          // Set date and time values in the UI
          var timezoneTime = response,
            tzDateTimeObj = _self.getFormattedDateTimeObject(timezoneTime, true);

          if (_self.populate) {
            // Get the current date/time to fill the fields that are empty
            timezoneNowObj = _self.getFormattedDateTimeObject(_self.startTzDateTimeStr, true);
          }

          if (emptyTime) {
            // The date was calculated using refTimeVal so the time field should really be
            // blank or be populated with the current date; this is for backwards compatibility since
            // before it was possible to save only the date or only the time.
            tzDateTimeObj.time = _self.populate ? timezoneNowObj.time : '';
          }

          _self.populateDateTime(tzDateTimeObj, _self.timeEl);
          // The date/time restored should be correct; however, the fields are validated so that the validation icon is rendered
          // in case the fields are required
          _self.validate(null, _self);
        },
        failure: function (response) {
          console.log('Unable to convert stored date/time values');
          if (_self.timeEl) {
            _self.timeEl.value = '';
            _self.timeEl.dataset.value = '';
          }
        }
      };

      refDateVal = nowObj.date;

      dateVal = refDateVal;
      timeVal = value;
      emptyDate = true;
      emptyTime = false;

      const timeZoneToConvert = this.useCustomTimezone ? this.timezone : this.displayTimezone;
      this.convertDateTime(dateVal, timeVal, timeZoneToConvert, false, cb);
    } else {
      // No value exists yet
      if (this.populate) {
        var res = this.startTzDateTimeStr.split(' ');
        var currentDate = res[0] + ' ' + res[1];
        var changeDate = _self.doDatePopulateExpression(new Date(currentDate));
        var adjustedTimeZoneObj = _self.getFormattedDateTimeObject(
          CStudioAuthoring.Utils.formatDateToStudio(changeDate),
          true
        );
        _self.populateDateTime(adjustedTimeZoneObj, _self.timeEl);
        _self.validate(null, _self);
      }
      this.validate(null, this);
    }
  },

  doDatePopulateExpression: function (currentDate) {
    var modifier = 1;

    if (this.checkPopulateDateExpisValid()) {
      var populateDateExp = this.populateDateExp.replace(/ /g, '');
      var action = populateDateExp.match(/(\+|\-)/gi)[0];
      var value = populateDateExp.match(/\d+/gi)[0];
      var type = populateDateExp.match(/((hours)|(minutes))/gi);
      if (action == '-') {
        modifier = modifier * -1;
      }
      if (type == 'hours') {
        currentDate.setTime(currentDate.getTime() + modifier * (value * 60 * 60 * 1000));
      } else if (type == 'minutes') {
        currentDate.setTime(currentDate.getTime() + modifier * value * 60000);
      }
    }
    return currentDate;
  },

  checkPopulateDateExpisValid: function () {
    if (this.populateDateExp) {
      if (this.populateDateExp.replace(/ /g, '').match(/(now)?(\+|\-)\d+((hours)|(minutes))/gi)) {
        return true;
      }
    }
    return false;
  },

  getCurrentDateTime: function (now, configTimezone, callback) {
    var dtObj = this.getDateTimeObject(now);

    this.convertDateTime(dtObj.date, dtObj.time, configTimezone, false, callback);
  },

  setStaticTimezone: function (value, timezone) {
    var timezoneElt = document.getElementById(this.id + '-timezoneCode');
    if (timezoneElt) {
      var timezoneStr = timezone.substr(0, 3);
      $(timezoneElt).html(this.displayTimezone);
      timezoneElt.classList.add('static-timezone');
    }
    this._setValue(value, timezone);
  },

  _setValue: function (value, configTimezone) {
    var storedVal = CStudioAuthoring.Utils.formatDateToStudio(value),
      nowObj = new Date(),
      cgTz = configTimezone,
      _self = this;

    var cb = {
      success: function (response) {
        var timezoneNow = response;
        _self.startTzDateTimeStr = timezoneNow;

        _self.routeDateTimePopulation(storedVal);
      },
      failure: function (response) {
        _self.startTzDateTimeStr = '';
        console.log('Unable to convert current date/time');
      }
    };
    this.startDateTimeObj = nowObj;
    this.getCurrentDateTime(nowObj, configTimezone, cb);
  },

  setValue: function (value) {
    this.edited = false;
    this.timezone = this.form.getModelValue(this.timezoneId);

    if (this.useCustomTimezone) {
      if (this.timezone) {
        this.setSelectedTimezone(this.timezone);
      } else {
        this.timezone = this.getSelectedTimezone();
      }

      this._setValue(value, this.timezone);
    } else {
      if (!this.timezone) {
        CStudioAuthoring.Service.lookupConfigurtion(CStudioAuthoringContext.site, '/site-config.xml', {
          context: this,

          success: function (config) {
            const configTimezone = config.locale?.dateTimeFormatOptions?.timeZone;
            if (configTimezone) {
              this.context.displayTimezone = configTimezone;
            }
            this.context.timezone = configTimezone ?? this.context.defaultTimezone;
            // displayTimezone is used to render the value in the UI
            this.context.setStaticTimezone(value, this.context.displayTimezone);
          },

          failure: function () {
            // displayTimezone is used to render the value in the UI
            this.setStaticTimezone(value, this.displayTimezone);
          }
        });
      } else {
        this.setStaticTimezone(value, this.timezone);
      }
    }
  },

  getSelectedTimezone: function (selectEl) {
    if (!selectEl) {
      selectEl = YDom.get(this.id + '-timezoneCode');
    }

    return selectEl.options[selectEl.selectedIndex].value;
  },

  setSelectedTimezone: function (timezone, selectEl) {
    if (!selectEl) {
      selectEl = YDom.get(this.id + '-timezoneCode');
    }

    var options = selectEl.options;
    for (var i = 0; i < options.length; i++) {
      if (options[i].value == timezone) {
        selectEl.selectedIndex = i;
      }
    }
  },

  setDateTime: function (value) {
    var dateTimePath = this.form.model,
      dateTime,
      studioFormat,
      date = new Date(),
      dd = date.getDate(),
      mm = date.getMonth() + 1, // January is 0!
      yyyy = date.getFullYear(),
      hh = date.getHours(),
      m = date.getMinutes(),
      date = mm + '/' + dd + '/' + yyyy;

    if (this.getDescendantProp(dateTimePath, this.id) && value != '') {
      studioFormat = CStudioAuthoring.Utils.formatDateToStudio(this.getDescendantProp(dateTimePath, this.id));
      dateTime = [date, studioFormat];
    } else {
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      time = hh + ':' + m + ':' + '00';
      dateTime = [date, time];
    }

    this.timeEl.value = Boolean(value) ? this.formatTime(value) : value;
    this.timeEl.dataset.value = value;
    dateTime[1] = value;

    this.value = this.convertDateTime(dateTime[0], dateTime[1], this.timezone, true, null);

    this.validate(null, this, true);

    this.value = this.getFieldValue();
    this.form.updateModel(this.id, this.value);
    this.form.updateModel(this.timezoneId, this.timezone);
  },

  getDescendantProp: function (obj, desc) {
    var arr = desc.split('|');
    while (arr.length && (obj = obj[arr.shift()]));
    return obj;
  },

  getName: function () {
    return 'time';
  },

  getSupportedProperties: function () {
    return [
      {
        label: CMgs.format(langBundle, 'showClear'),
        name: 'showClear',
        type: 'boolean',
        defaultValue: 'false'
      },
      {
        label: CMgs.format(langBundle, 'setNowLink'),
        name: 'showNowLink',
        type: 'boolean',
        defaultValue: 'false'
      },
      {
        label: CMgs.format(langBundle, 'populated'),
        name: 'populate',
        type: 'boolean',
        defaultValue: 'true'
      },
      {
        label: CMgs.format(langBundle, 'populateExpression'),
        name: 'populateDateExp',
        type: 'string',
        defaultValue: 'now'
      },
      {
        label: CMgs.format(langBundle, 'useCustomTimezone'),
        name: 'useCustomTimezone',
        type: 'boolean',
        defaultValue: 'false'
      },
      { label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' },
      {
        label: CMgs.format(langBundle, 'readonlyOnEdit'),
        name: 'readonlyEdit',
        type: 'boolean',
        defaultValue: 'false'
      }
    ];
  },

  getSupportedConstraints: function () {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  },

  getSupportedPostFixes: function () {
    return this.supportedPostFixes;
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-time', CStudioForms.Controls.Time);
