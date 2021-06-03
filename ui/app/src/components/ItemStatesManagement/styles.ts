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
    root: {
      height: '100%',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    },
    wrapper: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    filterButton: {
      marginRight: '12px'
    },
    drawerPaper: {
      padding: theme.spacing(2)
    },
    iconLabel: {
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginRight: '5px'
      }
    },
    inputPath: {
      marginTop: '20px'
    },
    helperText: {
      marginLeft: 0
    },
    formControl: {
      marginTop: '20px'
    },
    formLabel: {
      color: theme.palette.text.primary,
      textTransform: 'uppercase',
      marginBottom: '10px'
    },
    formGroup: {}
  })
);
