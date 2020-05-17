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

import React from 'react';
import ReactDOM from 'react-dom';
import Guest from './components/Guest';
import GuestProxy from './components/GuestProxy';
import DropMarker from './components/DropMarker';
import CrafterCMSPortal from './components/CrafterCMSPortal';
import AssetUploaderMask from './components/AssetUploaderMask';
import { useGuestContext, GuestContextProvider } from './components/GuestContext';
import ZoneMarker from './components/ZoneMarker';
import Spinner from './components/Spinner';

function addAuthoringSupport({ modelId, path }) {
  const guestProxyElement = document.createElement('craftercms-guest-proxy');
  ReactDOM.render(
    <Guest modelId={modelId} path={path}>
      <GuestProxy />
    </Guest>,
    guestProxyElement
  );
}

export {
  Guest,
  Spinner,
  GuestProxy,
  ZoneMarker,
  DropMarker,
  CrafterCMSPortal,
  AssetUploaderMask,
  GuestContextProvider,
  useGuestContext,
  addAuthoringSupport
};
