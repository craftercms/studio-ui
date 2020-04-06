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
 */

import $ from 'jquery';
import { message$, post } from './communicator';
import { filter, map } from 'rxjs/operators';
import { GUEST_CHECK_IN, GUEST_CHECK_OUT, NAVIGATION_REQUEST } from './util';

message$.pipe(
  filter((e: MessageEvent) => (e.data?.type) != null),
  map(e => e.data)
).subscribe(function ({ type, payload }) {
  switch (type) {
    case NAVIGATION_REQUEST: {
      window.location.href = payload.url;
      break;
    }
    default:
      console.warn(`[message$] Unhandled host message "${type}".`);
  }
});

const location = window.location.href;
const origin = window.location.origin;
const url = location.replace(origin, '');

post(GUEST_CHECK_IN, { url, location, origin, site: null, __CRAFTERCMS_GUEST_LANDING__: true });

setTimeout(() => {
  $('img').fadeIn();
}, 700);

window.onbeforeunload = () => {
  post(GUEST_CHECK_OUT);
};
