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
  itemsList: {
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    padding: 0,
    height: '100%'
  },
  submissionTextField: {
    marginTop: '10px'
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  submittedBy: {
    flexGrow: 0,
    width: '100px',
    textAlign: 'right',
    alignSelf: 'flex-start'
  },
  listSubHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.divider}`,
    lineHeight: '30px'
  },
  subHeaderItem: {
    marginLeft: '40px'
  }
}));
