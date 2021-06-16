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

import { createStyles, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(() =>
  createStyles({
    menu: {
      maxWidth: 110,
      padding: '10px 10px'
    },
    menuRoot: {
      '&.MuiInput-underline::before': {
        display: 'none'
      },
      '&.MuiInput-underline::after': {
        display: 'none'
      },
      background: 'transparent'
    },
    menuItem: {
      maxWidth: 390,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block'
    },
    input: {
      border: 'none',
      background: 'transparent',
      '&:focus:invalid, &:focus': {
        border: 'none',
        boxShadow: 'none'
      }
    }
  })
);

export default useStyles;
