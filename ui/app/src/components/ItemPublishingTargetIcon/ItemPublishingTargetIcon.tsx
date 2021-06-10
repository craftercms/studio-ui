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
import { getItemPublishingTargetText } from '../ItemDisplay/utils';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';
import { CSSProperties } from '@material-ui/styles';
import { DetailedItem, SandboxItem } from '../../models/Item';

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
}

const useStyles = makeStyles(() =>
  createStyles<ItemPublishingTargetIconClassKey, ItemPublishingTargetIconStyles>({
    root: (styles) => ({
      color: palette.gray.medium2,
      ...styles.root
    }),
    publishingTargetLive: (styles) => ({
      color: palette.green.main,
      ...styles.publishingTargetLive
    }),
    publishingTargetStaged: (styles) => ({
      color: palette.blue.main,
      ...styles.publishingTargetStaged
    }),
    publishingIcon: (styles) => ({
      ...styles.publishingIcon
    })
  })
);

export default function ItemPublishingTargetIcon(props: ItemPublishingTargetIconProps) {
  const { item, classes: propClasses, styles, className } = props;
  const classes = useStyles(styles);

  return (
    <Tooltip title={getItemPublishingTargetText(item.stateMap)}>
      <PublishingTargetIcon
        className={clsx(
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
