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

export const useStyles = makeStyles()((theme) => ({
  container: {
    height: '100%',
    display: 'flex',
    maxWidth: '100%',
    minWidth: '500px',
    minHeight: '60vh',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      maxWidth: '100%'
    }
  },
  containerBackgroundInverse: {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black
  },
  containerBackgroundSquaredLight: {
    backgroundSize: '30px 30px',
    backgroundColor: 'transparent',
    backgroundPosition: '0px 0px, 0px 15px, 15px -15px, -15px 0px',
    backgroundImage: `linear-gradient(45deg, ${theme.palette.grey[200]} 25%, transparent 25%), linear-gradient(-45deg, ${theme.palette.grey[200]} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${theme.palette.grey[200]} 75%), linear-gradient(-45deg, transparent 75%, ${theme.palette.grey[200]} 75%)`
  },
  containerBackgroundSquaredDark: {
    backgroundSize: '30px 30px',
    backgroundColor: theme.palette.common.black,
    backgroundPosition: '0px 0px, 0px 15px, 15px -15px, -15px 0px',
    backgroundImage: `linear-gradient(45deg, ${palette.gray.dark4} 25%, transparent 25%), linear-gradient(-45deg, ${palette.gray.dark4} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${palette.gray.dark4} 75%), linear-gradient(-45deg, transparent 75%, ${palette.gray.dark4} 75%)`
  },
  editor: {
    position: 'absolute',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey['300'],
    '& .ace_gutter': {
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : null
    }
  }
}));
