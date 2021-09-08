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

import { Theme } from '@mui/material/styles';
import palette from '../../styles/palette';
import { PublishingStatusTileProps } from '../PublishingStatusTile';

export const getPublishingStatusCodeColor = (code: PublishingStatusTileProps['status'], theme: Theme) => {
  switch (code) {
    case 'ready': {
      return theme.palette.success.main;
    }
    case 'publishing': {
      return theme.palette.info.main;
    }
    case 'queued': {
      return palette.indigo.main;
    }
    case 'stopped': {
      return theme.palette.warning.main;
    }
    case 'error': {
      return theme.palette.error.main;
    }
  }
};
