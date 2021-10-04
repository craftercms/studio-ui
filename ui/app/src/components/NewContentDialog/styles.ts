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
import palette from '../../styles/palette';

export const useStyles = makeStyles(() =>
  createStyles({
    compact: {
      marginRight: 'auto'
    },
    dialogContent: {
      minHeight: 455
    },
    cardsContainer: {
      marginTop: 14
    },
    searchBox: {
      minWidth: '33%'
    },
    emptyStateImg: {
      width: 250,
      marginBottom: 17
    }
  })
);

export const useContentCardStyles = makeStyles(() => ({
  defaultCard: {
    maxWidth: 345,
    cursor: 'pointer'
  },
  compactCard: {
    display: 'flex',
    cursor: 'pointer'
  },
  media: {
    paddingTop: '75%'
  },
  compactMedia: {
    width: 151
  },
  selected: {
    border: `1px solid ${palette.blue.tint}`
  }
}));

export default useStyles;
