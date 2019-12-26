/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import moment from 'moment-timezone';

export function getTimezones(){
  const timeZones = moment.tz.names();
  let offsetTmz=[];

  timeZones.forEach((timeZoneLabel: string, index: any) => {
    offsetTmz.push({
      timezoneName: timeZoneLabel,
      timezoneOffset: `${moment.tz(timeZones[index]).format('Z')}`
    });
  });

  return offsetTmz.sort((a, b) => (parseInt(a.timezoneOffset) > parseInt(b.timezoneOffset)) ? 1 : -1);
}

export default {
  getTimezones
};
