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

import React, { CSSProperties, useEffect, useState } from 'react';
import { getZoneMarkerStyle } from '../utils/dom';

interface ZoneMarkerProps {
  rect: DOMRect;
  label: string;
  inherited: boolean;
  classes?: {
    marker?: string;
    label?: string;
  };
}

export default function ZoneMarker(props: ZoneMarkerProps) {
  const { rect, label, classes, inherited } = props;
  const [zoneStyle, setZoneStyle] = useState<CSSProperties>();
  useEffect(() => {
    setZoneStyle(getZoneMarkerStyle(rect));
  }, [rect]);
  return (
    <craftercms-zone-marker style={zoneStyle} class={classes?.marker}>
      <craftercms-zone-marker-label class={classes?.label}>
        {label}
        {inherited && (
          <img className="craftercms-zone-marker-icon" src="/studio/static-assets/images/inheritedIcon.svg" alt="" />
        )}
      </craftercms-zone-marker-label>
    </craftercms-zone-marker>
  );
}
