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
    dropZone: {
      height: '150px',
      padding: '10px',
      border: `2px dashed ${theme.palette.divider}`,
      borderRadius: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    },
    over: {
      borderColor: theme.palette.primary.main,
      opacity: 0.5
    },
    disableContentOver: {
      pointerEvents: 'none'
    },
    fileNameWrapper: {
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        margin: '0 5px'
      }
    },
    fileName: {
      '&.success': {
        color: theme.palette.success.main
      },
      '&.error': {
        textDecoration: 'line-through'
      }
    },
    card: {
      display: 'flex',
      position: 'relative'
    },
    cardContent: {
      display: 'flex',
      flexGrow: 1
    },
    validationMessage: {
      color: theme.palette.error.main,
      display: 'flex',
      '& svg': {
        marginRight: '5px'
      }
    },
    fileContent: {
      flexGrow: 1
    },
    fileActions: {
      display: 'flex',
      alignItems: 'center'
    },
    cover: {
      width: '120px'
    },
    browseButton: {
      marginLeft: '5px'
    }
  })
);
