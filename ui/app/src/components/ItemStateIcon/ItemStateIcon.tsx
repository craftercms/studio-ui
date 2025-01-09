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
import palette from '../../styles/palette';
import { CSSObject as CSSProperties } from 'tss-react';
import { DetailedItem, ItemStates, SandboxItem } from '../../models/Item';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { PartialSxRecord } from '../../models';

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
  sxs?: PartialSxRecord<ItemStateIconClassKey>;
  className?: string;
  styles?: ItemStateIconStyles;
  displayTooltip?: boolean;
  fontSize?: SvgIconProps['fontSize'];
}

export function ItemStateIcon(props: ItemStateIconProps) {
  const { item, sxs, styles, className, displayTooltip = true, fontSize } = props;
  const { Icon, stateSpecificSx } = useMemo(() => {
    if (item.systemType === 'folder') {
      return {
        Icon: NotInWorkflowIcon,
        stateSpecificSx: { color: palette.gray.medium4, ...styles?.stateNotInWorkflow, ...sxs?.stateNotInWorkflow }
      };
    }
    let map: { [key in ItemStates]: any };
    map = {
      new: {
        Icon: NewStateIcon,
        stateSpecificSx: { color: palette.teal.main, ...styles?.stateNewIcon, ...sxs?.stateNewIcon }
      },
      modified: {
        Icon: EditedStateIcon,
        stateSpecificSx: { color: palette.yellow.main, ...styles?.stateModifiedIcon, ...sxs?.stateModifiedIcon }
      },
      deleted: {
        Icon: DeletedStateIcon,
        stateSpecificSx: { color: palette.red.main, ...styles?.stateDeletedIcon, ...sxs?.stateDeletedIcon }
      },
      locked: {
        Icon: LockedStateIcon,
        stateSpecificSx: { color: palette.orange.main, ...styles?.stateLockedIcon, ...sxs?.stateLockedIcon }
      },
      systemProcessing: {
        Icon: SystemProcessingStateIcon,
        stateSpecificSx: {
          color: palette.indigo.main,
          ...styles?.stateSystemProcessingIcon,
          ...sxs?.stateSystemProcessingIcon
        }
      },
      submitted: {
        Icon: SubmittedStateIcon,
        stateSpecificSx: { color: palette.purple.main, ...styles?.stateSubmittedIcon, ...sxs?.stateSubmittedIcon }
      },
      scheduled: {
        Icon: ScheduledStateIcon,
        stateSpecificSx: { color: palette.green.main, ...styles?.stateScheduledIcon, ...sxs?.stateScheduledIcon }
      },
      publishing: {
        Icon: CloudUploadOutlinedIcon,
        stateSpecificSx: { color: palette.indigo.main, ...styles?.statePublishingIcon, ...sxs?.statePublishingIcon }
      },
      submittedToStaging: {
        Icon: item.stateMap.submitted ? SubmittedStateIcon : ScheduledStateIcon,
        stateSpecificSx: {
          color: palette.blue.main,
          ...styles?.stateSubmittedToStagingIcon,
          ...sxs?.stateSubmittedToStagingIcon
        }
      },
      submittedToLive: {
        Icon: item.stateMap.submitted ? SubmittedStateIcon : ScheduledStateIcon,
        stateSpecificSx: {
          color: palette.green.main,
          ...styles?.stateSubmittedToLiveIcon,
          ...sxs?.stateSubmittedToLiveIcon
        }
      },
      staged: null,
      live: null,
      disabled: {
        Icon: BlockRoundedIcon,
        stateSpecificSx: { color: palette.pink.main, ...styles?.stateDisabledIcon, ...sxs?.stateDisabledIcon }
      },
      translationUpToDate: null,
      translationPending: null,
      translationInProgress: null
    };
    return (
      map[getItemStateId(item.stateMap)] ?? {
        Icon: NotInWorkflowIcon,
        stateSpecificSx: { color: palette.gray.medium4, ...styles?.stateNotInWorkflow, ...sxs?.stateNotInWorkflow }
      }
    );
  }, [styles, sxs, item]);
  return Icon === null ? null : item.systemType === 'folder' ? (
    <Icon
      sx={{
        ...styles?.root,
        ...sxs?.root,
        ...stateSpecificSx
      }}
      className={className}
      fontSize={fontSize}
    />
  ) : (
    <Tooltip
      title={displayTooltip ? getItemStateText(item.stateMap, { user: item.lockOwner?.username }) : ''}
      open={displayTooltip ? void 0 : false}
    >
      <Icon
        sx={{
          ...styles?.root,
          ...sxs?.root,
          ...stateSpecificSx
        }}
        className={className}
        fontSize={fontSize}
      />
    </Tooltip>
  );
}

export default ItemStateIcon;
