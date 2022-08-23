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
  | 'confirmTitleIcon'
  | 'itemsListRoot'
  | 'listItem'
  | 'divider'
  | 'conflictsTitle';

export type RecycleBinRestoreDialogFullSx = FullSxRecord<RecycleBinRestoreDialogClassKey>;

export type RecycleBinRestoreDialogPartialSx = PartialSxRecord<RecycleBinRestoreDialogClassKey>;

export function getStyles(sx?: RecycleBinRestoreDialogPartialSx): RecycleBinRestoreDialogFullSx {
  return {
    confirmTitleIcon: {
      fontSize: 16,
      verticalAlign: 'middle',
      mr: 1
    },
    itemsListRoot: {
      pl: 1
    },
    listItem: {
      display: 'list-item',
      ml: '16px',
      pl: 0,
      listStyleType: 'initial'
    },
    divider: {
      mt: 2,
      mb: 2
    },
    conflictsTitle: {
      mb: 1
    }
  };
}
