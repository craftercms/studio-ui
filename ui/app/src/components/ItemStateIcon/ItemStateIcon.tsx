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
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import BlockRoundedIcon from '@material-ui/icons/BlockRounded';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import clsx from 'clsx';
import * as React from 'react';
import { useMemo } from 'react';
import { getItemStateId, getItemStateText } from '../ItemDisplay/utils';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';
import { CSSProperties } from '@material-ui/styles';
import { DetailedItem, ItemStates, SandboxItem } from '../../models/Item';

export type ItemStateIconClassKey =
  | 'root'
  | 'stateNewIcon'
  | 'stateModifiedIcon'
  | 'stateDeletedIcon'
  | 'stateLockedIcon'
  | 'stateSystemProcessingIcon'
  | 'stateSubmittedIcon'
  | 'stateSubmittedToStagingIcon'
  | 'stateSubmittedToLiveIcon'
  | 'stateScheduledIcon'
  | 'statePublishingIcon'
  | 'stateDisabledIcon';

export type ItemStateIconStyles = Partial<Record<ItemStateIconClassKey, CSSProperties>>;

export interface ItemStateIconProps {
  item: DetailedItem | SandboxItem;
  classes?: Partial<Record<ItemStateIconClassKey, string>>;
  className?: string;
  styles?: ItemStateIconStyles;
  displayTooltip?: boolean;
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
      color: palette.indigo.main,
      ...styles.stateSystemProcessingIcon
    }),
    stateSubmittedIcon: (styles) => ({
      color: palette.purple.main,
      ...styles.stateSubmittedIcon
    }),
    stateSubmittedToStagingIcon: (styles) => ({
      color: palette.blue.main,
      ...styles.stateSubmittedToStagingIcon
    }),
    stateSubmittedToLiveIcon: (styles) => ({
      color: palette.green.main,
      ...styles.stateSubmittedToLiveIcon
    }),
    stateScheduledIcon: (styles) => ({
      color: palette.green.main,
      ...styles.stateScheduledIcon
    }),
    statePublishingIcon: (styles) => ({
      color: palette.indigo.main,
      ...styles.statePublishingIcon
    }),
    stateDisabledIcon: (styles) => ({
      color: palette.pink.main,
      ...styles.stateDisabledIcon
    })
  })
);

export default function ItemStateIcon(props: ItemStateIconProps) {
  const { item, classes: propClasses, styles, className, displayTooltip = true } = props;
  const classes = useStyles(styles);
  const { Icon, stateSpecificClass } = useMemo(() => {
    let map: { [key in ItemStates]: any };
    map = {
      new: { Icon: NewStateIcon, stateSpecificClass: classes.stateNewIcon },
      modified: { Icon: EditedStateIcon, stateSpecificClass: classes.stateModifiedIcon },
      deleted: { Icon: DeletedStateIcon, stateSpecificClass: classes.stateDeletedIcon },
      locked: { Icon: LockedStateIcon, stateSpecificClass: classes.stateLockedIcon },
      systemProcessing: { Icon: SystemProcessingStateIcon, stateSpecificClass: classes.stateSystemProcessingIcon },
      submitted: { Icon: SubmittedStateIcon, stateSpecificClass: classes.stateSubmittedIcon },
      scheduled: { Icon: ScheduledStateIcon, stateSpecificClass: classes.stateScheduledIcon },
      publishing: { Icon: CloudUploadOutlinedIcon, stateSpecificClass: classes.statePublishingIcon },
      submittedToStaging: {
        Icon: item.stateMap.submitted ? SubmittedStateIcon : ScheduledStateIcon,
        stateSpecificClass: classes.stateSubmittedToStagingIcon
      },
      submittedToLive: {
        Icon: item.stateMap.submitted ? SubmittedStateIcon : ScheduledStateIcon,
        stateSpecificClass: classes.stateSubmittedToLiveIcon
      },
      staged: null,
      live: null,
      disabled: { Icon: BlockRoundedIcon, stateSpecificClass: classes.stateDisabledIcon },
      translationUpToDate: null,
      translationPending: null,
      translationInProgress: null
    };
    return map[getItemStateId(item.stateMap)] ?? { Icon: null, stateSpecificClass: null };
  }, [
    classes.stateDeletedIcon,
    classes.stateLockedIcon,
    classes.stateModifiedIcon,
    classes.stateNewIcon,
    classes.stateScheduledIcon,
    classes.stateSubmittedIcon,
    classes.stateSystemProcessingIcon,
    classes.statePublishingIcon,
    classes.stateSubmittedToStagingIcon,
    classes.stateSubmittedToLiveIcon,
    classes.stateDisabledIcon,
    item.stateMap
  ]);
  return Icon === null ? null : (
    <Tooltip title={displayTooltip ? getItemStateText(item.stateMap) : ''} open={displayTooltip ? void 0 : false}>
      <Icon className={clsx(classes.root, propClasses?.root, className, stateSpecificClass)} />
    </Tooltip>
  );
}
