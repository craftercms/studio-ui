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

import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CompareVersionsDialogProps } from './utils';
import CompareVersionsDialogContainer from './CompareVersionsDialogContainer';
import Dialog from '@material-ui/core/Dialog';

export const useStyles = makeStyles(() =>
  createStyles({
    dialogBody: {
      overflow: 'auto',
      minHeight: '50vh'
    },
    noPadding: {
      padding: 0
    },
    singleItemSelector: {
      marginBottom: '10px'
    },
    typography: {
      lineHeight: '1.5'
    }
  })
);

export default function CompareVersionsDialog(props: CompareVersionsDialogProps) {
  const isCompareMode = props.selectedA && props.selectedB;
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth={isCompareMode ? 'xl' : 'md'}>
      <CompareVersionsDialogContainer {...props} />
    </Dialog>
  );
}
