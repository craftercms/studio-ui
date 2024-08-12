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

export interface TimezoneDescriptor {
  name: string;
  offset: string;
}

export const getTimezones = ((zoneNames) => {
  let timeZones: TimezoneDescriptor[] = [];
  zoneNames.forEach((name, i) => {
    timeZones.push({
      name,
      offset: `${moment.tz(zoneNames[i]).format('Z')}`
    });
  });
  const sorted = timeZones.sort((a, b) => (parseInt(a.offset) > parseInt(b.offset) ? 1 : -1));
  return () => sorted;
})(moment.tz.names());

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
  date: string | number | Date,
  localeCode: string,
  dateTimeFormatOptions?: GlobalState['uiConfig']['locale']['dateTimeFormatOptions']
): string {
  return new Intl.DateTimeFormat(localeCode, dateTimeFormatOptions).format(new Date(date));
}

export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getUserLocaleCode(): string {
  return Intl.DateTimeFormat().resolvedOptions().locale;
}

/**
 * Create ISO 8601 string
 **/
export const create8601String = (date: string, time: string, offset: string) => `${date}T${time}${offset}`;

/**
 * Returns an array as ['yyyy-mm-dd', 'hh:mm:ss', '+/-nn:nn'] out of a ISO 8601 date string
 **/
export const get8601Pieces = (date: string | Date) => {
  const pieces = moment(date)
    .format()
    .match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(.{6})/);
  return [pieces[1], pieces[2], pieces[3]];
};

export function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Convert a time string from UTC to a custom timezone.
 * @param timeString - The time string in HH:MM:SS format.
 * @param timezone - The target timezone.
 * @returns The time string in the target timezone.
 */
export function convertTimeToTimezone(timeString: string, timezone: string = getUserTimeZone()): string {
  // Parse the time string in UTC
  const timeInUTC = moment.utc(timeString, 'HH:mm:ss');

  // Convert the time to the desired timezone
  const timeInTargetZone = timeInUTC.tz(timezone);

  // Format the time in the desired timezone
  return timeInTargetZone.format('HH:mm:ss');
}
