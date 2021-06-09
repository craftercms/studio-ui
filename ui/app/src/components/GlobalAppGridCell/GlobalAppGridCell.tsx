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
      borderBottom: 0,
      '&.checkbox': {
        width: '52px',
        textAlign: 'center',
        padding: 0
      },
      '&.avatar': {
        padding: 0,
        width: '60px'
      },
      '&.maxWidth300': {
        maxWidth: '300px'
      },
      '&.minWidth100': {
        minWidth: '100px'
      },
      '&.bordered': {
        borderBottom: `1px solid ${theme.palette.divider}`
      },
      '&.ellipsis': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
      '&.padded0': {
        padding: 0
      },
      '&.padded10': {
        padding: '10px 16px'
      },
      '&.expandableCell': {
        paddingLeft: '10'
      },
      '&.paddedLeft': {
        paddingLeft: '20px'
      },
      '&.width10': {
        width: '10%'
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
      '&.width40': {
        width: '40%'
      },
      '&.width50': {
        width: '50%'
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
