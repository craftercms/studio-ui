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

import React, { CSSProperties, useEffect, useState } from 'react';
import { getZoneMarkerStyle } from '../utils/dom';

export interface AssetUploaderMaskProps {
  rect?: DOMRect;
  label?: string;
  id?: number;
  key?: number;
  progress?: number;
}

export function AssetUploaderMask(props: AssetUploaderMaskProps) {
  const { rect, progress } = props,
    [zoneStyle, setZoneStyle] = useState<CSSProperties>();

  useEffect(() => {
    setZoneStyle(getZoneMarkerStyle(rect));
  }, [rect]);

  return (
    <craftercms-asset-uploader-mask-container style={zoneStyle}>
      <craftercms-asset-uploader-mask style={{ height: `${100 - progress}%` }} />
    </craftercms-asset-uploader-mask-container>
  );
}

export default AssetUploaderMask;
