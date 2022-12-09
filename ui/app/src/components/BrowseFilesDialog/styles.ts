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

export const useStyles = makeStyles()((theme) => ({
  dialogBody: {
    minHeight: '60vh'
  },
  searchRoot: {
    marginLeft: 'auto',
    maxWidth: '250px'
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, max-content))',
    gridGap: '16px',
    padding: 'initial'
  },
  mediaCardRoot: {
    cursor: 'pointer'
  },
  selectedCard: {
    boxShadow: `0px 0px 4px 4px ${theme.palette.primary.main}`
  },
  leftWrapper: {
    width: '270px',
    paddingRight: '16px'
  },
  rightWrapper: {
    flexGrow: 1
  },
  currentPath: {
    '& input': {
      width: '100%',
      background: 'none',
      border: 'none',
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeightMedium,
      color: theme.palette.text.primary,
      fontSize: '1.25rem',
      lineHeight: '1.6'
    }
  },
  drawer: {
    flexShrink: 0
  },
  drawerPaper: {
    top: 65,
    bottom: 0,
    right: 0,
    width: 300,
    zIndex: theme.zIndex.appBar - 1,
    height: 'auto',
    position: 'absolute'
  },
  drawerModal: {
    position: 'absolute',
    '& .MuiBackdrop-root': {
      background: 'transparent'
    }
  }
}));
