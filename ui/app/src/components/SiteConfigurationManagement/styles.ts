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
import palette from '../../styles/palette';

export const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      paddingRight: '14.4px'
    },
    textMargin: {
      marginBottom: '1em'
    },
    confirmDialogBody: {
      textAlign: 'left'
    },
    buttonGroup: {
      marginRight: '15px'
    },
    sampleEditor: {
      background: theme.palette.background.default,
      height: '100%',
      margin: 0,
      flex: '1 1 auto'
    },
    loadingStateRight: {
      width: '50%'
    },
    historyButton: {
      marginRight: 'auto'
    },
    drawerPaper: {
      top: '0 !important'
    },
    list: {
      width: '100%',
      overflow: 'auto',
      height: '100%'
    },
    ellipsis: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    searchBarRoot: {
      borderRadius: '0 !important',
      border: 0,
      '&.focus': {
        border: '0 !important',
        boxShadow: 'none'
      }
    },
    alert: {
      borderRadius: 0
    },
    listSubheader: {
      background: theme.palette.background.paper,
      padding: 0,
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    listSubheaderSkeleton: {
      height: '48px',
      display: 'flex',
      alignItems: 'center'
    },
    itemSkeletonText: {
      height: '20px'
    }
  })
);

export const useResizeableStyles = makeStyles((theme) =>
  createStyles({
    resizeHandle: {
      width: '2px',
      minWidth: '2px',
      margin: '0px 5px',
      cursor: 'ew-resize',
      padding: '4px 0 0',
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      transition: 'width 200ms',
      '&:hover': {
        width: '4px',
        visibility: 'visible',
        backgroundColor: palette.blue.tint
      }
    },
    resizeHandleActive: {
      width: '4px',
      visibility: 'visible',
      backgroundColor: palette.blue.tint
    }
  })
);

export default useStyles;
