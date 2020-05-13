/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import React, { PropsWithChildren, useMemo } from 'react';
import StandardAction from '../../models/StandardAction';
import Dialog from '@material-ui/core/Dialog';
import { useLogicResource, useUnmount } from '../../utils/hooks';
import DialogHeader from './DialogHeader';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { Resource } from '../../models/Resource';
import { WorkflowAffectedItem } from '../../models/Item';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { palette } from '../../styles/theme';

// region Typings

type Source = { workflowAffectedFiles: WorkflowAffectedItem[] };
type Return = Omit<Source, 'error'>;

interface WorkflowCancellationContentUIProps {
  resource: Resource<Return>;
  classes?: any;
}

interface WorkflowCancellationDialogUIProps {
  resource: Resource<Return>;
  classes?: any;
  onClose?(): void;
  onClosed?(): void;
  onDismiss?(): void;
  onContinue?(response): void;
}

interface WorkflowCancellationDialogBaseProps {
  open: boolean;
  workflowAffectedFiles?: WorkflowAffectedItem[];
  onContinueProps?: any;      //TODO: type
}

export type WorkflowCancellationDialogProps = PropsWithChildren<WorkflowCancellationDialogBaseProps & {
  onClose?(response?: any): any;
  onClosed?(response?: any): any;
  onDismiss?(response?: any): any;
  onContinue?(response?: any): any;
}>;

export interface WorkflowCancellationDialogStateProps extends WorkflowCancellationDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
  onContinue?: StandardAction;
}

// endregion

const useStyles = makeStyles(() =>
  createStyles({
    contentRoot: {
      height: '254px'
    },
    filesList: {
      height: '100%',
      border: '1px solid #D8D8DC',
      backgroundColor: palette.white,
      padding: 0
    }
  })
);

function WorkflowCancellationContentUI(props: WorkflowCancellationContentUIProps) {
  const {
    resource,
    classes
  } = props;

  const { workflowAffectedFiles } = resource.read();

  return (
    <Grid container spacing={3} className={classes.contentRoot}>
      <Grid item xs={12}>
        <List className={classes.filesList}>
          {
            workflowAffectedFiles.map(file =>
              <ListItem key={file.browserUri}>
                <ListItemText primary={file.name} secondary={file.browserUri} />
              </ListItem>
            )
          }
        </List>
      </Grid>
    </Grid>
  );
}

function WorkflowCancellationDialogUI(props: WorkflowCancellationDialogUIProps) {
  const {
    resource,
    onClose,
    onDismiss,
    onContinue,
    classes
  } = props;

  return (
    <>
      <DialogHeader
        id="workflowCancellationDialogTitle"
        title={
          <FormattedMessage
            id="workflowCancellation.title" defaultMessage="Warning: Workflow Cancellation"
          />
        }
        subtitle={
          <FormattedMessage
            id="workflowCancellation.subtitle"
            defaultMessage="Edit will cancel all items that are in the scheduled deployment batch. Please review the list of files below and chose “Continue” to cancel workflow and edit or “Cancel” to remain in your dashboard."
          />
        }
        onDismiss={onDismiss}
      />
      <DialogBody id="confirmDialogBody">
        <SuspenseWithEmptyState
          resource={resource}
          withEmptyStateProps={{
            emptyStateProps: {
              title: (
                <FormattedMessage
                  id="publishDialog.noItemsSelected"
                  defaultMessage="There are no affected files"
                />
              )
            },
            isEmpty: (value) => value.workflowAffectedFiles.length === 0
          }}
        >
          <WorkflowCancellationContentUI
            resource={resource}
            classes={classes}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <DialogActions>
          {onClose && (
            <Button onClick={onClose} variant="contained">
              <FormattedMessage id="workflowCancellation.cancel" defaultMessage="Cancel" />
            </Button>
          )}
          {onContinue && (
            <Button onClick={onContinue} variant="contained" color="primary" autoFocus>
              <FormattedMessage id="workflowCancellation.continue" defaultMessage="Continue" />
            </Button>
          )}
        </DialogActions>
      </DialogFooter>
    </>
  );
}

export default function WorkflowCancellationDialog(props: WorkflowCancellationDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="requestPublishDialogTitle"
      fullWidth
      maxWidth="sm"
    >
      <WorkflowCancellationDialogWrapper {...props} />
    </Dialog>
  );
}

function WorkflowCancellationDialogWrapper(props: WorkflowCancellationDialogProps) {
  const {
    workflowAffectedFiles,
    onClose,
    onClosed,
    onDismiss,
    onContinue,
    onContinueProps
  } = props;
  useUnmount(props.onClosed);

  const workflowCancellationSource = useMemo(() => ({
    workflowAffectedFiles
  }), [workflowAffectedFiles]);

  const resource = useLogicResource<Return, Source>(workflowCancellationSource, {
    shouldResolve: (source) => Boolean(source.workflowAffectedFiles),
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => ({
      workflowAffectedFiles: source.workflowAffectedFiles
    }),
    errorSelector: (source) => null
  });

  const onContinueClick = () => {
    onDismiss();
    onContinue({
      ...onContinueProps
    });
  };

  return (
    <WorkflowCancellationDialogUI
      resource={resource}
      onClose={onClose}
      onClosed={onClosed}
      onDismiss={onDismiss}
      onContinue={onContinueClick}
      classes={useStyles()}
    />
  );
}
