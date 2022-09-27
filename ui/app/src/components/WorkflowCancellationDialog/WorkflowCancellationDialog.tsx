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
import { FormattedMessage } from 'react-intl';
import EnhancedDialog from '../EnhancedDialog';
import WorkflowCancellationDialogContainer from './WorkflowCancellationDialogContainer';
import { WorkflowCancellationDialogProps } from './utils';

export function WorkflowCancellationDialog(props: WorkflowCancellationDialogProps) {
  const { items, onContinue, ...rest } = props;

  return (
    <EnhancedDialog
      title={<FormattedMessage id="workflowCancellation.title" defaultMessage="Warning: Workflow Cancellation" />}
      dialogHeaderProps={{
        subtitle: (
          <FormattedMessage
            id="workflowCancellation.subtitle"
            defaultMessage="Edit will cancel all items that are in the scheduled deployment batch. Please review the list of files below and chose “Continue” to cancel workflow and edit or “Cancel” to remain in your dashboard."
          />
        )
      }}
      {...rest}
    >
      <WorkflowCancellationDialogContainer items={items} onContinue={onContinue} />
    </EnhancedDialog>
  );
}

export default WorkflowCancellationDialog;
