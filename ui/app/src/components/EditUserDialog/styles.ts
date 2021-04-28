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
    header: {
      padding: '30px 40px',
      display: 'flex',
      alignItems: 'center'
    },
    chip: {
      background: theme.palette.info.main,
      color: theme.palette.text.primary,
      marginLeft: 'auto'
    },
    avatar: {
      marginRight: '30px',
      width: '90px',
      height: '90px'
    },
    actions: {
      marginLeft: 'auto'
    },
    userInfo: {},
    body: {
      padding: 0
    },
    section: {
      padding: '30px 40px'
    },
    row: {
      display: 'flex',
      padding: '10px 0',
      alignItems: 'center'
    },
    userNameWrapper: {
      width: '100%',
      display: 'flex',
      alignItems: 'center'
    },
    switchWrapper: {
      width: '100%',
      marginLeft: '-12px'
    },
    formActions: {
      display: 'flex',
      paddingBottom: '20px',
      '& button:first-child': {
        marginLeft: 'auto',
        marginRight: '10px'
      }
    },
    label: {
      flexBasis: '180px',
      '& + .MuiInputBase-root': {
        marginTop: '0 !important'
      }
    },
    sectionTitle: {
      textTransform: 'uppercase',
      marginBottom: '10px'
    },
    siteItem: {
      margin: '10px 0'
    }
  })
);

export default useStyles;
