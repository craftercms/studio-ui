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

import moment from 'moment-timezone';
import { defineMessages } from 'react-intl';
import { getCurrentIntl } from './i18n';
import GlobalState from '../models/GlobalState';

const translations = defineMessages({
  ordinals: {
    id: 'dateTime.ordinals',
    defaultMessage: '{day, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'
  }
});

export function getTimezones() {
  const timeZones = moment.tz.names();
  let offsetTmz = [];

  timeZones.forEach((timeZoneLabel: string, index: any) => {
    offsetTmz.push({
      timezoneName: timeZoneLabel,
      timezoneOffset: `${moment.tz(timeZones[index]).format('Z')}`
    });
  });

  return offsetTmz.sort((a, b) => (parseInt(a.timezoneOffset) > parseInt(b.timezoneOffset) ? 1 : -1));
}

export function asDayMonthDateTime(date: string): string {
  const parts = getCurrentIntl().formatDateToParts(date, {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    year: 'numeric'
  });
  return `${parts[0].value} ${parts[2].value} ${getCurrentIntl().formatMessage(translations.ordinals, {
    day: parts[4].value
  })} ${parts[6].value} @ ${getCurrentIntl().formatTime(date)}`;
}

export function asLocalizedDateTime(
  date: string,
  localeCode: string,
  dateTimeFormatOptions: GlobalState['uiConfig']['locale']['dateTimeFormatOptions']
): string {
  return new Intl.DateTimeFormat(localeCode, dateTimeFormatOptions).format(new Date(date));
}
