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

export type AlertDialogClassKey = 'dialog' | 'dialogImage' | 'dialogBody' | 'dialogTitle' | 'dialogFooter';
export type AlertDialogFullSx = FullSxRecord<AlertDialogClassKey>;
export type AlertDialogPartialSx = PartialSxRecord<AlertDialogClassKey>;

export function getStyles(sx?: AlertDialogPartialSx): AlertDialogFullSx {
  return {
    dialog: {
      '& .MuiPaper-root': {
        borderRadius: '20px'
      },
      ...sx?.dialog
    },
    dialogImage: {
      paddingBottom: '35px',
      ...sx?.dialogImage
    },
    dialogBody: {
      textAlign: 'center',
      padding: '40px 20px 0 !important',
      ...sx?.dialogBody
    },
    dialogTitle: {
      paddingBottom: '5px',
      ...sx?.dialogTitle
    },
    dialogFooter: {
      borderTop: 'none !important',
      display: 'flex',
      flexDirection: 'column',
      padding: '25px 40px 35px !important',
      mt: 2,
      '& button': {
        fontWeight: 600,
        letterSpacing: '0.46px'
      },
      '& > :not(:first-child)': {
        marginTop: '10px',
        marginLeft: 0
      },
      ...sx?.dialogFooter
    }
  };
}
