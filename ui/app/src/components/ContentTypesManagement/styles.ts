/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { FullSxRecord, PartialSxRecord } from '../../models';

export type ContentTypesManagementClassKey = 'drawer' | 'body';

export type ContentTypesManagementFullSx = FullSxRecord<ContentTypesManagementClassKey>;

export type ContentTypesManagementPartialSx = PartialSxRecord<ContentTypesManagementClassKey>;

const drawerWidth = 286;

export function getStyles(sx?: ContentTypesManagementPartialSx): ContentTypesManagementFullSx {
  return {
    drawer: {
      width: drawerWidth,
      marginTop: '65px',
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        p: 1,
        top: '65px',
        bottom: 0,
        boxSizing: 'border-box',
        height: 'auto'
      },
      ...sx?.drawer
    },
    body: {
      height: 'calc(100vh - 65px)',
      overflowY: 'scroll',
      width: '100%',
      p: 2,
      ...sx?.body
    }
  };
}

export default getStyles;
