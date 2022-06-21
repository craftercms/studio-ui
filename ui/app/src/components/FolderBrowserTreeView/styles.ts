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

const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  loadingState: {
    flexGrow: 1,
    flexDirection: 'unset'
  }
}));

export const useSkeletonStyles = makeStyles()(() => ({
  iconContainer: {
    display: 'none'
  },

  label: {
    background: 'none',
    '&:hover': {
      background: 'none'
    }
  }
}));

export const useTreeNodeStyles = makeStyles<void, 'treeItemContent' | 'treeItemSelected'>()(
  (_theme, _params, classes) => ({
    loading: {
      display: 'flex',
      alignItems: 'center',
      padding: '2px',
      marginLeft: '5px',
      '& p': {
        marginLeft: '10px'
      }
    },
    treeItemRoot: {
      [`&:focus > .${classes.treeItemContent}, &.${classes.treeItemSelected} > .${classes.treeItemContent}`]: {
        color: `${palette.blue.main}`
      }
    },
    treeItemContent: {},
    treeItemSelected: {},
    treeItemLabel: {
      width: 'auto',
      padding: '0 4px',
      borderRadius: '5px'
    }
  })
);

export default useStyles;
