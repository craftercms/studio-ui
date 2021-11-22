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

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      height: '100vh',
      width: '100%'
    },
    wrapper: {
      transition: theme.transitions.create('padding-left', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    nav: {
      overflow: 'auto'
    },
    icon: {
      marginRight: '10px'
    },
    footerDescription: {
      color: theme.palette.text.secondary,
      '& > a': {
        textDecoration: 'none',
        color: theme.palette.primary.main
      }
    },
    footer: {
      padding: '20px 0',
      textAlign: 'center'
    },
    logo: {
      margin: '0 auto 10px auto'
    },
    drawerBody: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: theme.spacing(2)
    },
    drawerPaper: {
      position: 'absolute'
    },
    launcher: {
      margin: '10px 12px 0 auto'
    }
  })
);

export const embeddedStyles = makeStyles((theme) =>
  createStyles({
    root: {
      height: '100%'
    }
  })
);

export default useStyles;
