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

import React from 'react';
import ReactDOM from 'react-dom';
import { Guest } from './components/Guest';
import { GuestProxy } from './components/GuestProxy';

const guestProxyElement = document.createElement('craftercms-guest-proxy');

ReactDOM.render(
  <Guest
    modelId="8d7f21fa-5e09-00aa-8340-853b7db302da"
    documentDomain="authoring.sample.com"
  >
    <GuestProxy/>
  </Guest>,
  guestProxyElement
);
