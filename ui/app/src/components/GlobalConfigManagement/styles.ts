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

import createStyles from '@mui/styles/createStyles';

import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      margin: '0',
      width: '100%',
      height: '100%',
      borderRadius: 0,
      border: 0
    },
    paper: {
      borderRadius: 0,
      minHeight: '400px',
      height: 'calc(100vh - 120px)',
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    marginLeftAuto: {
      marginLeft: 'auto',
      marginRight: '15px'
    }
  })
);

export default useStyles;
