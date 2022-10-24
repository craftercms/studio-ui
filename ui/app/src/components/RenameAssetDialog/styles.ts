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

export type RenameAssetDialogClassKey = 'emptyMessage' | 'emptyMessageIcon';

export type RenameAssetDialogFullSx = FullSxRecord<RenameAssetDialogClassKey>;

export type RenameAssetDialogPartialSx = PartialSxRecord<RenameAssetDialogClassKey>;

function getStyles(sx?: RenameAssetDialogPartialSx): RenameAssetDialogFullSx {
  return {
    emptyMessage: {
      verticalAlign: 'middle',
      display: 'inline-flex',
      mt: 2,
      ...sx?.emptyMessage
    },
    emptyMessageIcon: (theme) => ({
      color: theme.palette.text.secondary,
      mr: 1
    })
  };
}

export default getStyles;
