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

import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { EnhancedDialog } from '../EnhancedDialog';
import { HistoryDialogContainer } from './HistoryDialogContainer';
import { HistoryDialogProps } from './utils';
import { FormattedMessage } from 'react-intl';

export const historyStyles = makeStyles()(() => ({
  dialogBody: {
    overflow: 'auto',
    minHeight: '50vh'
  },
  dialogFooter: {
    padding: 0
  }
}));

export const paginationStyles = makeStyles()((theme) => ({
  pagination: {
    marginLeft: 'auto',
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '& p': {
      padding: 0
    },
    '& svg': {
      top: 'inherit'
    },
    '& .hidden': {
      display: 'none'
    }
  },
  toolbar: {
    padding: 0,
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: '20px',
    '& .MuiTablePagination-spacer': {
      display: 'none'
    },
    '& .MuiTablePagination-spacer + p': {
      display: 'none'
    }
  }
}));

export function HistoryDialog(props: HistoryDialogProps) {
  const { versionsBranch, error, ...rest } = props;
  return (
    <EnhancedDialog title={<FormattedMessage id="historyDialog.headerTitle" defaultMessage="Item History" />} {...rest}>
      <HistoryDialogContainer versionsBranch={versionsBranch} error={error} />
    </EnhancedDialog>
  );
}

export default HistoryDialog;
