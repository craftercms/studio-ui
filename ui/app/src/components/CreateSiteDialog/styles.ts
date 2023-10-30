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
import { keyframes } from 'tss-react';
import { fadeIn } from 'react-animations';

export const useStyles = makeStyles()((theme) => ({
  fadeIn: {
    animation: `${keyframes`${fadeIn}`} 1s`
  },
  containerGrid: {
    alignContent: 'baseline'
  },
  paperScrollPaper: {
    height: 'calc(100% - 100px)',
    maxHeight: '1200px'
  },
  searchContainer: {
    width: '100%',
    zIndex: 1
  },
  dialogContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  dialogContent: {
    padding: 0
  },
  slide: {
    flexWrap: 'wrap',
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    padding: '25px'
  },
  simpleTab: {
    minWidth: '80px',
    minHeight: '0',
    padding: '0 0 5px 0',
    marginRight: '20px',
    opacity: 1,
    '& span': {
      textTransform: 'none'
    }
  },
  tabIcon: {
    fontSize: '1.2rem',
    cursor: 'pointer',
    '&.selected': {
      color: theme.palette.primary.main
    }
  },
  loading: {
    position: 'relative',
    padding: 16,
    flexGrow: 1
  },
  spinner: {
    marginRight: '10px',
    color: theme.palette.text.secondary
  },
  statePaper: {
    height: '100%'
  },
  loadingStateRoot: {
    minHeight: 'calc(100% - 85px)',
    height: 'calc(100% - 85px)',
    margin: 0
  },
  loadingStateGraphicRoot: {
    flexGrow: 1,
    paddingBottom: '100px'
  },
  loadingStateGraphic: {
    width: 200
  },
  errorPaperRoot: {
    height: '100%'
  },
  blueprintFormRoot: {
    marginTop: 10
  },
  emptyStateRoot: {
    width: '100%'
  },
  showIncompatible: {
    marginLeft: 'auto'
  },
  showIncompatibleInput: {
    fontSize: '0.8125rem'
  },
  showIncompatibleCheckbox: {
    paddingTop: 0,
    paddingBottom: 0
  },
  marketplaceActions: {
    display: 'flex',
    alignItems: 'center'
  },
  marketplaceUnavailable: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    rowGap: theme.spacing(2),
    padding: theme.spacing(5)
  },
  marketplaceUnavailableIcon: {
    color: theme.palette.text.secondary
  }
}));
