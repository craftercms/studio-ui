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

import NewStateIcon from '@material-ui/icons/NewReleasesOutlined';
import EditedStateIcon from '@material-ui/icons/EditOutlined';
import DeletedStateIcon from '@material-ui/icons/DeleteOutlineRounded';
import LockedStateIcon from '../Icons/LockOutline';
import SystemProcessingStateIcon from '@material-ui/icons/HourglassEmptyRounded';
import SubmittedStateIcon from '../Icons/PlanePaperOutline';
import ScheduledStateIcon from '@material-ui/icons/AccessTimeRounded';
import UnknownStateIcon from '@material-ui/icons/HelpOutlineRounded';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import clsx from 'clsx';
import * as React from 'react';
import { getItemStateText } from '../ItemDisplay/utils';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';
import { CSSProperties } from '@material-ui/styles';
import { DetailedItem, SandboxItem } from '../../models/Item';

export type ItemStateIconClassKey =
  | 'root'
  | 'stateNewIcon'
  | 'stateModifiedIcon'
  | 'stateDeletedIcon'
  | 'stateLockedIcon'
  | 'stateSystemProcessingIcon'
  | 'stateSubmittedIcon'
  | 'stateScheduledIcon'
  | 'publishingIcon';
export type ItemStateIconStyles = Partial<Record<ItemStateIconClassKey, CSSProperties>>;

export interface ItemStateIconProps {
  item: DetailedItem | SandboxItem;
  classes?: Partial<Record<ItemStateIconClassKey, string>>;
  className?: string;
  styles?: ItemStateIconStyles;
}

const useStyles = makeStyles(() =>
  createStyles<ItemStateIconClassKey, ItemStateIconStyles>({
    root: (styles) => ({
      ...styles.root
    }),
    stateNewIcon: (styles) => ({
      color: palette.teal.main,
      ...styles.stateNewIcon
    }),
    stateModifiedIcon: (styles) => ({
      color: palette.yellow.main,
      ...styles.stateModifiedIcon
    }),
    stateDeletedIcon: (styles) => ({
      color: palette.red.main,
      ...styles.stateDeletedIcon
    }),
    stateLockedIcon: (styles) => ({
      color: palette.orange.main,
      ...styles.stateLockedIcon
    }),
    stateSystemProcessingIcon: (styles) => ({
      color: palette.pink.main,
      ...styles.stateSystemProcessingIcon
    }),
    stateSubmittedIcon: (styles) => ({
      color: palette.purple.main,
      ...styles.stateSubmittedIcon
    }),
    stateScheduledIcon: (styles) => ({
      color: palette.green.main,
      ...styles.stateScheduledIcon
    }),
    publishingIcon: (styles) => ({
      ...styles.publishingIcon
    })
  })
);

export default function ItemStateIcon(props: ItemStateIconProps) {
  const { item, classes: propClasses, styles, className } = props;
  const classes = useStyles(styles);
  let TheIcon = UnknownStateIcon;
  let stateSpecificClass;
  switch (true) {
    case item.stateMap.systemProcessing:
      TheIcon = SystemProcessingStateIcon;
      stateSpecificClass = classes.stateSystemProcessingIcon;
      break;
    case item.stateMap.locked:
      TheIcon = LockedStateIcon;
      stateSpecificClass = classes.stateLockedIcon;
      break;
    case item.stateMap.deleted:
      TheIcon = DeletedStateIcon;
      stateSpecificClass = classes.stateDeletedIcon;
      break;
    case item.stateMap.modified:
      TheIcon = EditedStateIcon;
      stateSpecificClass = classes.stateModifiedIcon;
      break;
    case item.stateMap.scheduled:
      TheIcon = ScheduledStateIcon;
      stateSpecificClass = classes.stateScheduledIcon;
      break;
    case item.stateMap.submitted:
      TheIcon = SubmittedStateIcon;
      stateSpecificClass = classes.stateSubmittedIcon;
      break;
    case item.stateMap.new:
      TheIcon = NewStateIcon;
      stateSpecificClass = classes.stateNewIcon;
      break;
  }
  return (
    <Tooltip title={getItemStateText(item.stateMap)}>
      <TheIcon
        className={clsx(classes.root, propClasses?.root, className, classes.publishingIcon, stateSpecificClass)}
      />
    </Tooltip>
  );
}
