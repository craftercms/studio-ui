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

const useStyles = makeStyles()((theme) => ({
  search: {
    padding: `${theme.spacing(1)} ${theme.spacing(1)} 0`
  },
  select: {
    width: '100%',
    marginTop: theme.spacing(1)
  }
}));

export const useComponentsPanelUI = makeStyles()((theme) => ({
  browsePanelWrapper: {
    padding: `0 0 ${theme.spacing(4)} 0`
  },
  noResultsImage: {
    width: '150px'
  },
  noResultsTitle: {
    fontSize: 'inherit',
    marginTop: '10px'
  },
  helperTextWrapper: {
    margin: '10px 16px',
    paddingTop: '10px',
    textAlign: 'center',
    lineHeight: 1.2,
    borderTop: `1px solid ${theme.palette.divider}`
  }
}));

export default useStyles;
