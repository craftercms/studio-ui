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

import Tooltip from '@mui/material/Tooltip';
import PublishingTargetIcon from '@mui/icons-material/FiberManualRecordRounded';
import * as React from 'react';
import { getItemPublishingTargetText } from '../ItemDisplay/utils';
import { CSSObject as CSSProperties } from 'tss-react';
import { DetailedItem, SandboxItem } from '../../models/Item';
import { useStyles } from './styles';
import { SvgIconProps } from '@mui/material/SvgIcon';

export type ItemPublishingTargetIconClassKey =
  | 'root'
  | 'publishingTargetLive'
  | 'publishingTargetStaged'
  | 'publishingIcon';
export type ItemPublishingTargetIconStyles = Partial<Record<ItemPublishingTargetIconClassKey, CSSProperties>>;

export interface ItemPublishingTargetIconProps {
  item: DetailedItem | SandboxItem;
  classes?: Partial<Record<ItemPublishingTargetIconClassKey, string>>;
  className?: string;
  styles?: ItemPublishingTargetIconStyles;
  displayTooltip?: boolean;
  fontSize?: SvgIconProps['fontSize'];
}

export function ItemPublishingTargetIcon(props: ItemPublishingTargetIconProps) {
  const { item, classes: propClasses, styles, className, displayTooltip = true, fontSize } = props;
  const { classes, cx } = useStyles(styles);

  return (
    <Tooltip
      title={displayTooltip ? getItemPublishingTargetText(item.stateMap) : ''}
      open={displayTooltip ? void 0 : false}
    >
      <PublishingTargetIcon
        fontSize={fontSize}
        className={cx(
          classes.root,
          classes.publishingIcon,
          propClasses?.root,
          className,
          item.stateMap.live
            ? classes.publishingTargetLive
            : item.stateMap.staged
              ? classes.publishingTargetStaged
              : false
        )}
      />
    </Tooltip>
  );
}

export default ItemPublishingTargetIcon;
