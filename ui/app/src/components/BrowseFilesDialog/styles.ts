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
    minHeight: '60vh',
    padding: 0
  },
  dialogContent: {
    overflow: 'hidden'
  },
  searchRoot: {
    maxWidth: '200px',
    background: 'none !important',
    border: 'none !important',
    borderRadius: 0,
    boxShadow: 'none'
  },
  searchInput: {
    padding: '8px 5px'
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
    minWidth: '270px',
    padding: '16px',
    overflow: 'auto',
    rowGap: theme.spacing(1)
  },
  rightWrapper: {
    flexGrow: 1,
    padding: '16px',
    overflow: 'auto'
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
  semiBold: {
    fontWeight: 600
  },
  actionsBar: {
    paddingLeft: theme.spacing(1),
    marginBottom: theme.spacing(3),
    borderRadius: 4
  },
  actionsBarDivider: {
    marginTop: '-3px',
    marginBottom: '-3px'
  },
  sortingSelect: {
    minWidth: '180px'
  }
}));
