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

import NewStateIcon from '@mui/icons-material/NewReleasesOutlined';
import EditedStateIcon from '@mui/icons-material/EditOutlined';
import DeletedStateIcon from '@mui/icons-material/DeleteOutlineRounded';
import LockedStateIcon from '../../icons/Lock';
import SystemProcessingStateIcon from '@mui/icons-material/HourglassEmptyRounded';
import SubmittedStateIcon from '../../icons/PaperPlane';
import ScheduledStateIcon from '@mui/icons-material/AccessTimeRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import NotInWorkflowIcon from '@mui/icons-material/PanoramaFishEyeRounded';
import Tooltip from '@mui/material/Tooltip';
import * as React from 'react';
import { useMemo } from 'react';
import { getItemStateId, getItemStateText } from '../ItemDisplay/utils';
import { makeStyles } from 'tss-react/mui';
import palette from '../../styles/palette';
import { CSSObject as CSSProperties } from 'tss-react';
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
  | 'stateDisabledIcon'
  | 'stateNotInWorkflow';

export type ItemStateIconStyles = Partial<Record<ItemStateIconClassKey, CSSProperties>>;

export interface ItemStateIconProps {
  item: DetailedItem | SandboxItem;
  classes?: Partial<Record<ItemStateIconClassKey, string>>;
  className?: string;
  styles?: ItemStateIconStyles;
  displayTooltip?: boolean;
}

const useStyles = makeStyles<ItemStateIconStyles, ItemStateIconClassKey>()(
  (
    _theme,
    {
      root,
      stateNewIcon,
      stateModifiedIcon,
      stateDeletedIcon,
      stateLockedIcon,
      stateSystemProcessingIcon,
      stateSubmittedIcon,
      stateSubmittedToStagingIcon,
      stateSubmittedToLiveIcon,
      stateScheduledIcon,
      statePublishingIcon,
      stateDisabledIcon,
      stateNotInWorkflow
    } = {} as ItemStateIconStyles
  ) => ({
    root: {
      ...root
    },
    stateNewIcon: {
      color: palette.teal.main,
      ...stateNewIcon
    },
    stateModifiedIcon: {
      color: palette.yellow.main,
      ...stateModifiedIcon
    },
    stateDeletedIcon: {
      color: palette.red.main,
      ...stateDeletedIcon
    },
    stateLockedIcon: {
      color: palette.orange.main,
      ...stateLockedIcon
    },
    stateSystemProcessingIcon: {
      color: palette.indigo.main,
      ...stateSystemProcessingIcon
    },
    stateSubmittedIcon: {
      color: palette.purple.main,
      ...stateSubmittedIcon
    },
    stateSubmittedToStagingIcon: {
      color: palette.blue.main,
      ...stateSubmittedToStagingIcon
    },
    stateSubmittedToLiveIcon: {
      color: palette.green.main,
      ...stateSubmittedToLiveIcon
    },
    stateScheduledIcon: {
      color: palette.green.main,
      ...stateScheduledIcon
    },
    statePublishingIcon: {
      color: palette.indigo.main,
      ...statePublishingIcon
    },
    stateDisabledIcon: {
      color: palette.pink.main,
      ...stateDisabledIcon
    },
    stateNotInWorkflow: {
      color: palette.gray.medium4,
      ...stateNotInWorkflow
    }
  })
);

export function ItemStateIcon(props: ItemStateIconProps) {
  const { item, classes: propClasses, styles, className, displayTooltip = true } = props;
  const { classes, cx } = useStyles(styles);
  const { Icon, stateSpecificClass } = useMemo(() => {
    if (item.systemType === 'folder') {
      return { Icon: NotInWorkflowIcon, stateSpecificClass: classes.stateNotInWorkflow };
    }
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
    return (
      map[getItemStateId(item.stateMap)] ?? {
        Icon: NotInWorkflowIcon,
        stateSpecificClass: classes.stateNotInWorkflow
      }
    );
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
    classes.stateNotInWorkflow,
    item
  ]);
  return Icon === null ? null : item.systemType === 'folder' ? (
    <Icon className={cx(classes.root, propClasses?.root, className, stateSpecificClass)} />
  ) : (
    <Tooltip
      title={displayTooltip ? getItemStateText(item.stateMap, { user: item.lockOwner }) : ''}
      open={displayTooltip ? void 0 : false}
    >
      <Icon className={cx(classes.root, propClasses?.root, className, stateSpecificClass)} />
    </Tooltip>
  );
}

export default ItemStateIcon;
