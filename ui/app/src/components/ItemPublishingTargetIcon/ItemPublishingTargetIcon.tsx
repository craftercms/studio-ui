/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import PublishingTargetIcon from '@material-ui/icons/FiberManualRecordRounded';
import clsx from 'clsx';
import * as React from 'react';
import { ItemIconProps } from '../ItemDisplay';
import { getItemPublishingTargetText } from '../ItemDisplay/utils';

export default function ItemPublishingTargetIcon(props: ItemIconProps) {
  const { item, classes } = props;
  return (
    <Tooltip title={getItemPublishingTargetText(item.stateMap)}>
      <PublishingTargetIcon
        className={clsx(
          classes.icon,
          classes.publishingIcon,
          item.stateMap.live && classes.publishingTargetLive,
          item.stateMap.staged && classes.publishingTargetStaged
        )}
      />
    </Tooltip>
  );
}
