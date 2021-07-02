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

export const useStyles = makeStyles((theme) =>
  createStyles({
    dialogBody: {},
    searchRoot: {
      marginBottom: '6px'
    },
    mediaCardRoot: {
      width: '200px',
      height: '155px',
      margin: '10px',
      '&.selected': {
        boxShadow: `0px 2px 1px -1px ${theme.palette.primary.main}, 0px 1px 1px 0px ${theme.palette.primary.main}, 0px 1px 3px 0px ${theme.palette.primary.main}`
      }
    }
  })
);
