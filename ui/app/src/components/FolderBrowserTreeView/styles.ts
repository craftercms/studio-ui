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

const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'column'
    },
    loadingState: {
      flexGrow: 1,
      flexDirection: 'unset'
    }
  })
);

export const useSkeletonStyles = makeStyles(() =>
  createStyles({
    iconContainer: {
      display: 'none'
    },
    label: {
      background: 'none',
      '&:hover': {
        background: 'none'
      }
    }
  })
);

export const useTreeNodeStyles = makeStyles(() =>
  createStyles({
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
      '&:focus > $treeItemContent, &$treeItemSelected > $treeItemContent': {
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

export const usePathSelectedStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      display: 'flex',
      padding: '10px 12px',
      border: `1px solid  ${palette.gray.light1}`,
      borderRadius: '5px',
      '&.invalid': {
        borderColor: palette.red.main
      }
    },
    selected: {
      fontWeight: 600,
      marginRight: '10px'
    },
    root: {
      flexGrow: 1
    },
    invisibleInput: {
      padding: 0,
      border: 0,
      background: 'none',
      height: '100%',
      '&:focus': {
        borderColor: 'none',
        boxShadow: 'inherit'
      }
    },
    invalid: {
      '& $invisibleInput': {
        color: palette.red.main
      }
    }
  })
);

export default useStyles;
