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

import { FullSxRecord, PartialSxRecord } from '../../models';

export type RecycleBinRestoreDialogClassKey =
  | 'itemsListRoot'
  | 'listItem'
  | 'divider'
  | 'conflictsTitle'
  | 'conflictsTableContainer'
  | 'conflictsTableRoot';

export type RecycleBinRestoreDialogFullSx = FullSxRecord<RecycleBinRestoreDialogClassKey>;

export type RecycleBinRestoreDialogPartialSx = PartialSxRecord<RecycleBinRestoreDialogClassKey>;

export function getStyles(sx?: RecycleBinRestoreDialogPartialSx): RecycleBinRestoreDialogFullSx {
  return {
    itemsListRoot: {
      pl: '26px'
    },
    listItem: {
      display: 'list-item',
      ml: '16px',
      pl: 0,
      listStyleType: 'initial'
    },
    divider: {
      mt: 2,
      mb: 2,
      ml: -2,
      mr: -2,
      width: 'calc(100% + 32px)'
    },
    conflictsTitle: {
      mb: 1
    },
    conflictsTableContainer: {
      marginLeft: '-16px',
      marginRight: '-16px',
      marginBottom: '-16px',
      backgroundColor: (theme) => theme.palette.background.paper,
      width: 'calc(100% + 32px)'
    },
    conflictsTableRoot: {
      '& .MuiTableRow-root:last-child .MuiTableCell-root': {
        borderBottom: 'none'
      }
    }
  };
}
