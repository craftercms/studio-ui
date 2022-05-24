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

import { makeStyles } from 'tss-react/mui';
import palette from '../../styles/palette';
import { ItemPublishingTargetIconClassKey, ItemPublishingTargetIconStyles } from './ItemPublishingTargetIcon';

export const LIVE_COLOUR = palette.green.main;
export const STAGING_COLOUR = palette.blue.main;

export const useStyles = makeStyles<ItemPublishingTargetIconStyles, ItemPublishingTargetIconClassKey>()(
  (
    _theme,
    { root, publishingTargetLive, publishingTargetStaged, publishingIcon } = {} as ItemPublishingTargetIconStyles
  ) => ({
    root: {
      color: palette.gray.medium2,
      ...root
    },
    publishingTargetLive: {
      color: LIVE_COLOUR,
      ...publishingTargetLive
    },
    publishingTargetStaged: {
      color: STAGING_COLOUR,
      ...publishingTargetStaged
    },
    publishingIcon: {
      ...publishingIcon
    }
  })
);
