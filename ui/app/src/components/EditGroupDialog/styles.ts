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

export const useStyles = makeStyles()(() => ({
  header: {
    padding: '30px 40px',
    display: 'flex',
    alignItems: 'center'
  },
  actions: {
    marginLeft: 'auto'
  },
  body: {
    padding: 0
  },
  section: {
    padding: '30px 40px',
    '&.noPaddingBottom': {
      paddingBottom: 0
    }
  },
  sectionTitle: {
    textTransform: 'uppercase',
    marginBottom: '10px'
  },
  sectionTitleEdit: {
    textTransform: 'uppercase',
    marginBottom: '30px'
  },
  label: {
    flexBasis: '180px',
    '& + .MuiInputBase-root': {
      marginTop: '0 !important'
    }
  },
  formActions: {
    display: 'flex',
    paddingBottom: '20px',
    '& button:first-child': {
      marginLeft: 'auto',
      marginRight: '10px'
    }
  },
  fullWidth: {
    width: '100%'
  }
}));
