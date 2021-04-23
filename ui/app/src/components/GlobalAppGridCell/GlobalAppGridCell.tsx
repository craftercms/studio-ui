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

import { createStyles, Theme, withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';

const GlobalAppGridCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '4px',
      borderBottom: 0,
      height: '50px',
      '&.avatar': {
        padding: 0,
        width: '50px'
      },
      '&.bordered': {
        borderBottom: `1px solid ${theme.palette.divider}`
      },
      '&.paddedLeft': {
        paddingLeft: '20px'
      },
      '&.width20': {
        width: '20%'
      },
      '&.width25': {
        width: '25%'
      },
      '&.width30': {
        width: '30%'
      },
      '&.width60': {
        width: '60%'
      },
      '&.width100': {
        width: '100%'
      }
    }
  })
)(TableCell);

export default GlobalAppGridCell;
