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

import React, { useEffect, useState } from 'react';
import { Markers } from '../classes/Markers';

interface ZoneMarkerProps {
  rect?: DOMRect;
  label?: string;
  id?: number;
  key?: number;
}

export function ZoneMarker(props: ZoneMarkerProps) {

  const //
    { rect, label } = props,
    [zoneStyle, setZoneStyle] = useState(),
    [labelStyle, setLabelStyle] = useState();

  useEffect(
    () => {
      setZoneStyle(Markers.getZoneMarkerStyle(rect));
      setLabelStyle(Markers.getZoneMarkerLabelStyle(rect));
    },
    [rect]
  );

  return (
    <craftercms-zone-marker style={zoneStyle}>
      <craftercms-zone-marker-label style={labelStyle}>{label}</craftercms-zone-marker-label>
    </craftercms-zone-marker>
  );

}
