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
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';

export type RecycleBinPackageDialogClassKey =
  | 'packageDetailsTableRoot'
  | 'itemsTableContainer'
  | 'itemsTable'
  | 'footer';

export type RecycleBinPackageDialogFullSx = FullSxRecord<RecycleBinPackageDialogClassKey>;

export type RecycleBinPackageDialogPartialSx = PartialSxRecord<RecycleBinPackageDialogClassKey>;

export function getStyles(sx?: RecycleBinPackageDialogPartialSx): RecycleBinPackageDialogFullSx {
  return {
    packageDetailsTableRoot: {
      [`& .${tableCellClasses.root}`]: {
        borderBottom: 'none'
      },
      [`& th.${tableCellClasses.root}`]: {
        fontWeight: (theme) => theme.typography.fontWeightMedium
      }
    },
    itemsTableContainer: {
      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      marginLeft: -2,
      marginRight: -2,
      marginBottom: -2,
      width: 'calc(100% + 32px)',
      backgroundColor: (theme) => theme.palette.background.paper
    },
    itemsTable: {
      border: 'none !important',
      '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-cell, &	.MuiDataGrid-cell--withRenderer & 	.MuiDataGrid-footerContainer':
        {
          border: 'none !important',
          outline: 'none !important'
        }
    },
    footer: {
      justifyContent: 'space-between'
    }
  } as Record<RecycleBinPackageDialogClassKey, SxProps<Theme>>;
}
