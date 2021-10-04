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

import $ from 'jquery';
import { message$, post } from './utils/communicator';
import {
  guestCheckIn,
  guestCheckOut,
  navigationRequest
} from '@craftercms/studio-ui/build_tsc/state/actions/preview';
import { createLocationArgument } from './utils/util';

message$.subscribe(function ({ type, payload }) {
  switch (type) {
    case navigationRequest.type: {
      window.location.href = payload.url;
      break;
    }
  }
});

const location = createLocationArgument();

post(guestCheckIn.type, { location, __CRAFTERCMS_GUEST_LANDING__: true });

setTimeout(() => {
  $('img').fadeIn();
}, 700);

window.onbeforeunload = () => {
  post(guestCheckOut.type);
};
