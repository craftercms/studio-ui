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
import { FormattedMessage } from 'react-intl';
import { WorkflowCancellationDialogUI } from './WorkflowCancellationDialogUI';
import React from 'react';
import { WorkflowCancellationDialogContainerProps } from './utils';
import { EmptyState } from '../EmptyState';

const useStyles = makeStyles()((theme) => ({
  suspense: {
    minHeight: '442px',
    margin: 0,
    justifyContent: 'center'
  },
  filesList: {
    height: '100%',
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    padding: 0
  }
}));

export function WorkflowCancellationDialogContainer(props: WorkflowCancellationDialogContainerProps) {
  const { items = [], onClose, onContinue } = props;
  const { classes } = useStyles();

  const onContinueClick = (e) => {
    onClose(e, null);
    onContinue();
  };

  return items.length > 0 ? (
    <WorkflowCancellationDialogUI
      items={items}
      onCloseButtonClick={(e) => onClose(e, null)}
      onContinue={onContinueClick}
      classes={classes}
    />
  ) : (
    <EmptyState
      title={
        <FormattedMessage
          id="workflowCancellationDialog.noAffectedFiles"
          defaultMessage="There are no affected files"
        />
      }
    />
  );
}

export default WorkflowCancellationDialogContainer;
