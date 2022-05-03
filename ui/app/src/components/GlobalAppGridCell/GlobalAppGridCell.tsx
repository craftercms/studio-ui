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

import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import TableCell from '@mui/material/TableCell';

const GlobalAppGridCell = withStyles(() =>
  createStyles({
    root: {
      '&.action': {
        paddingTop: 0,
        paddingBottom: 0
      },
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
      '&.bb0': {
        borderBottom: 0
      },
      '&.ellipsis': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
      '&.scroll-y': {
        overflowY: 'auto'
      },
      '&.scroll-x': {
        overflowX: 'auto'
      },
      '&.padded0': {
        padding: 0
      },
      '&.pl0': {
        paddingLeft: 0
      },
      '&.pl20': {
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
