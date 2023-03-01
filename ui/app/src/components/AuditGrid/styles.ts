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

import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  activeFilter: {
    color: theme.palette.primary.main,
    '& button': {
      color: theme.palette.primary.main
    }
  },
  cellRoot: {
    '&:focus-within': {
      outline: 'none !important'
    }
  },
  ellipsis: {
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  gridRoot: {
    border: '0 !important',
    minHeight: '300px',
    '& .MuiDataGrid-menuIcon': {
      width: 'auto !important',
      visibility: 'visible !important' as 'visible'
    },
    '& .MuiDataGrid-colCell:focus': {
      outline: 'none !important'
    }
  },
  paginationRoot: {
    marginLeft: 'auto',
    marginRight: '20px'
  }
}));
