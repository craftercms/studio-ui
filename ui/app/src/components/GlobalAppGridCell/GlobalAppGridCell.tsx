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
        paddingLeft: '0'
      },
      '&.paddedLeft': {
        paddingLeft: '20px'
      },
      '&.width10': {
        width: '10%'
      },
      '&.width15': {
        width: '15%'
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
      '&.width35': {
        width: '35%'
      },
      '&.width40': {
        width: '40%'
      },
      '&.width45': {
        width: '45%'
      },
      '&.width50': {
        width: '50%'
      },
      '&.width55': {
        width: '55%'
      },
      '&.width60': {
        width: '60%'
      },
      '&.width65': {
        width: '65%'
      },
      '&.width70': {
        width: '70%'
      },
      '&.width75': {
        width: '75%'
      },
      '&.width80': {
        width: '80%'
      },
      '&.width85': {
        width: '85%'
      },
      '&.width90': {
        width: '80%'
      },
      '&.width95': {
        width: '95%'
      },
      '&.width100': {
        width: '100%'
      }
    }
  })
)(TableCell);

export default GlobalAppGridCell;
