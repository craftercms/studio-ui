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
import cardTitleStyles from '../../styles/card';

export const sitesGridStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column'
    },
    paginationRoot: {
      '&:last-child': {
        alignSelf: 'flex-end',
        marginTop: '20px'
      }
    }
  })
);

export const cardStyles = makeStyles((theme) =>
  createStyles({
    media: {
      height: '226px'
    },
    card: {
      width: '402px',
      '&.compact': {
        display: 'flex'
      }
    },
    cardHeader: {
      height: '77px',
      width: '100%',
      '& .cardTitle': {
        ...cardTitleStyles
      },
      '& .cardSubtitle': {
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical'
      }
    }
  })
);
