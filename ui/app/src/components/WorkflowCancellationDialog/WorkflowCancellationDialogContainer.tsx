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

import createStyles from '@mui/styles/createStyles';

import makeStyles from '@mui/styles/makeStyles';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { FormattedMessage } from 'react-intl';
import { WorkflowCancellationDialogUI } from './WorkflowCancellationDialogUI';
import React from 'react';
import { Return, Source, WorkflowCancellationDialogContainerProps } from './utils';

export const useStyles = makeStyles((theme) =>
  createStyles({
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
  })
);

export default function WorkflowCancellationDialogContainer(props: WorkflowCancellationDialogContainerProps) {
  const { items, onClose, onContinue } = props;
  const classes = useStyles();

  const resource = useLogicResource<Return, Source>(items, {
    shouldResolve: (source) => Boolean(source),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

  const onContinueClick = (e) => {
    onClose(e, null);
    onContinue();
  };

  return (
    <SuspenseWithEmptyState
      resource={resource}
      withEmptyStateProps={{
        emptyStateProps: {
          title: <FormattedMessage id="publishDialog.noItemsSelected" defaultMessage="There are no affected files" />
        }
      }}
      loadingStateProps={{
        classes: {
          root: classes.suspense
        }
      }}
    >
      <WorkflowCancellationDialogUI
        resource={resource}
        onCloseButtonClick={(e) => onClose(e, null)}
        onContinue={onContinueClick}
        classes={classes}
      />
    </SuspenseWithEmptyState>
  );
}
