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
import Guest from './react/Guest';
import GuestProxy from './react/GuestProxy';
import DropMarker from './react/DropMarker';
import CrafterCMSPortal from './react/CrafterCMSPortal';
import AssetUploaderMask from './react/AssetUploaderMask';
import { GuestContextProvider, useGuestContext } from './react/GuestContext';
import ZoneMarker from './react/ZoneMarker';
import Spinner from './react/Spinner';
import ContentType from './react/ContentType';

export * from './react/Field';
export * from './react/hooks';

export {
  Guest,
  Spinner,
  GuestProxy,
  ZoneMarker,
  DropMarker,
  ContentType,
  CrafterCMSPortal,
  AssetUploaderMask,
  GuestContextProvider,
  useGuestContext
};

export function initPageBuilder({ modelId, path }) {
  const guestProxyElement = document.createElement('craftercms-guest-proxy');
  ReactDOM.render(
    <Guest modelId={modelId} path={path} isAuthoring>
      <GuestProxy />
    </Guest>,
    guestProxyElement
  );
}
