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
import palette from '../../styles/palette';

const flagColor = 'rgba(255, 59, 48, 0.5)';

export const useStyles = makeStyles()((theme) => ({
  widgetSection: {
    padding: '0 0 0 10px',
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
    top: 0,
    right: 0,
    display: 'flex',
    visibility: 'hidden',
    position: 'absolute'
  },
  optionsWrapperOver: {
    visibility: 'visible'
  },
  headerTitle: {
    flexGrow: 1
  },
  headerIcon: {
    marginRight: 10,
    color: theme.palette.action.active
  },
  accordion: {
    background: 'none'
  },
  accordionSummary: {},
  accordionSummaryContent: {
    alignItems: 'center',
    placeContent: 'center space-between',
    '&, &.Mui-expanded': {
      margin: 0
    }
  },
  accordionSummaryTitle: {
    display: 'flex',
    alignItems: 'center'
  },
  accordionSummaryActions: {},
  accordionDetails: {
    padding: 0,
    flexDirection: 'column'
  },
  pagesIcon: {
    fontSize: '1.1rem'
  },
  itemIconButton: {
    padding: '2px 3px',
    '&.Mui-disabled': {
      // Want the hover to trigger so the tooltip shows up.
      pointerEvents: 'all'
    }
  },
  leafTooltip: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText
  },
  searchRoot: {
    margin: '7px 10px 7px 0',
    height: '25px',
    width: '100%'
  },
  searchInput: {
    fontSize: '12px',
    padding: '5px !important'
  },
  searchCloseButton: {
    marginRight: '10px'
  },
  searchCloseIcon: {
    fontSize: '12px !important'
  },
  widgetAlert: {
    margin: theme.spacing(1)
  },
  childrenList: {
    marginBottom: theme.spacing(1)
  },
  // region Breadcrumbs
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  },
  breadcrumbsList: {
    display: 'flex',
    alignItems: 'center',
    '& li': {
      lineHeight: 1
    }
  },
  breadcrumbsSeparator: {
    margin: '0 2px'
  },
  breadcrumbsTypography: {
    fontWeight: 'bold',
    color: theme.palette.text.secondary
  },
  breadcrumbLast: {
    color: theme.palette.mode === 'dark' ? palette.teal.tint : palette.teal.shade,
    textDecoration: 'underline'
  },
  breadcrumbActionsWrapper: {
    display: 'flex',
    marginLeft: 'auto'
  },
  // endregion
  menuPaper: {
    width: '182px'
  },
  menuList: {
    padding: 0
  },
  // region Nav Item Styles
  icon: {
    fontSize: '1.2rem'
  },
  typeIcon: {
    marginRight: 5,
    fontSize: '1.2rem'
  },
  navItem: {
    minHeight: '23.5px',
    padding: '0 0 0 5px',
    marginLeft: 15,
    width: 'calc(100% - 15px)',
    '&.noLeftPadding': {
      paddingLeft: 0
    },
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.hover : theme.palette.grey['A200']
    }
  },
  currentPathItem: {
    paddingLeft: 0,
    marginLeft: 10,
    width: 'auto'
  },
  navItemLevelDescriptor: {},
  navItemText: {
    color: theme.palette.mode === 'dark' ? palette.teal.tint : palette.teal.shade,
    padding: 0,
    marginRight: 'auto',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '&.opacity': {
      opacity: '0.7'
    },
    '&.select-mode, &.non-navigable': {
      color: theme.palette.text.primary
    }
  },
  navItemCheckbox: {
    padding: '6px',
    color: theme.palette.primary.main
  }
  // endregion
}));

// TODO:
//  Production build styles are injected in different order than in development
//  causing our overrides to rather get overridden. This fixes.
//  { index: 1 }
