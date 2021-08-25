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
    dialogBody: {
      minHeight: '60vh'
    },
    searchRoot: {
      marginBottom: '16px'
    },
    emptyState: {
      flexGrow: 1
    },
    paginationRoot: {
      marginRight: 'auto'
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, max-content))',
      gridGap: '16px',
      justifyContent: 'space-evenly',
      padding: 'initial'
    },
    cardHeader: {
      padding: '0 9px'
    },
    mediaCardRoot: {
      width: '200px',
      height: '155px',
      cursor: 'pointer',
      '&.selected': {
        boxShadow: `0px 0px 4px 4px ${theme.palette.primary.main}`
      }
    },
    leftWrapper: {
      width: '200px',
      paddingRight: '16px'
    },
    rightWrapper: {
      flexGrow: 1
    }
  })
);

export const useCardStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '200px',
      height: '155px',
      margin: '10px'
    },
    media: {
      height: 0,
      paddingTop: '56.25%' // 16:9
    },
    cardHeader: {
      padding: '9px 12px'
    }
  })
);

export default useStyles;
