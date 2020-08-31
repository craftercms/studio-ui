/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import palette from '../../../styles/palette';

const flagColor = 'rgba(255, 59, 48, 0.5)';
export const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      '&.collapsed': {
        paddingBottom: 5
      }
    },
    widgetSection: {
      padding: `0 0 0 10px`,
      '& .MuiSvgIcon-root': {
        fontSize: '1.1rem'
      }
    },
    flag: {
      color: flagColor,
      fontSize: '1rem',
      marginLeft: '5px'
    },
    optionsWrapper: {
      marginLeft: 'auto',
      display: 'flex',
      visibility: 'hidden'
    },
    optionsWrapperOver: {
      visibility: 'visible'
    },
    // region Header
    headerRoot: {
      display: 'flex',
      padding: '0 10px 0',
      alignItems: 'center',
      cursor: 'pointer',
      '& .MuiSvgIcon-root': {
        fontSize: '1.1rem'
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      }
    },
    headerTitle: {
      marginLeft: '6px',
      flexGrow: 1
    },
    // endregion
    pagesIcon: {
      fontSize: '1.1rem'
    },
    iconButton: {
      padding: '6px'
    },
    itemIconButton: {
      padding: '2px 3px'
    },
    searchRoot: {},
    // region Breadcrumbs
    breadcrumbs: {
      display: 'flex',
      alignItems: 'center'
    },
    breadcrumbsList: {
      display: 'flex',
      alignItems: 'center',
      padding: '9px 0',
      '& li': {
        lineHeight: 1
      }
    },
    breadcrumbsSeparator: {
      margin: '0 2px'
    },
    breadcrumbsTypography: {
      fontWeight: 'bold',
      color: palette.gray.medium4
    },
    breadcrumbLast: {
      color: palette.teal.shade,
      textDecoration: 'underline'
    },
    // endregion
    // region Pagination
    pagination: {
      '& p': {
        padding: 0
      },
      '& svg': {
        top: 'inherit'
      },
      '& .hidden': {
        display: 'none'
      }
    },
    paginationToolbar: {
      display: 'flex',
      minHeight: '30px',
      justifyContent: 'space-between',
      '& .MuiTablePagination-spacer': {
        display: 'none'
      },
      '& .MuiTablePagination-spacer + p': {
        display: 'none'
      },
      '& .MuiButtonBase-root': {
        padding: 0
      }
    },
    // endregion
    menuPaper: {
      width: '182px'
    },
    menuList: {
      padding: 0
    },
    menuItemRoot: {
      whiteSpace: 'initial'
    },
    helperText: {
      padding: '10px 16px 10px 16px',
      color: '#8E8E93'
    },
    // region Nav Styles
    stateGraphics: {
      width: 100
    },
    // endregion
    // region Nav Item Styles
    icon: {
      fontSize: '1.2rem'
    },
    typeIcon: {
      marginRight: 5,
      fontSize: '1.2rem',
      color: palette.gray.medium4
    },
    navItem: {
      justifyContent: 'space-between',
      padding: '0 0 0 10px',
      '&.noLeftPadding': {
        paddingLeft: 0
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)'
      }
    },
    navItemText: {
      color: palette.teal.shade,
      padding: 0,
      marginRight: 'auto',
      '&.opacity': {
        opacity: '0.7'
      },
      '&.select-mode': {
        color: palette.black
      },
      '&.non-navigable': {
        color: palette.gray.medium7
      }
    },
    navItemCheckbox: {
      padding: '6px',
      color: theme.palette.primary.main
    }
    // endregion
  })
);
