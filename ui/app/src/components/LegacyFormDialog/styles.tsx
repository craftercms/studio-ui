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

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

export const useStyles = makeStyles(() =>
  createStyles({
    iframe: {
      height: '0',
      border: 0,
      '&.complete': {
        height: '100%',
        flexGrow: 1
      }
    },
    dialog: {
      minHeight: '90vh'
    },
    loadingRoot: {
      flexGrow: 1,
      justifyContent: 'center'
    },
    edited: {
      width: '12px',
      height: '12px',
      marginLeft: '5px'
    }
  })
);
