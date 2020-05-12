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

import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import StandardAction from '../../models/StandardAction';
import Dialog from '@material-ui/core/Dialog';
import { useActiveSiteId, useLogicResource, useSelection, useUnmount } from '../../utils/hooks';
import DialogHeader from './DialogHeader';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { getWorkflowAffectedFiles } from '../../services/content';
import { ApiResponse } from '../../models/ApiResponse';
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

type Source = { workflowAffectedFiles: WorkflowAffectedItem[]; error: ApiResponse; };
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
  path?: string;
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
      backgroundColor: palette.white
    }
  })
);

function WorkflowCancellationContentUI(props: WorkflowCancellationContentUIProps) {
  const {
    resource,
    classes
  } = props;

  const { workflowAffectedFiles }: { workflowAffectedFiles: WorkflowAffectedItem[] } = resource.read();

  return (
    // height 254px
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

  const title = 'Warning: Workflow Cancellation';
  const subtitle = 'Edit will cancel all items that are in the scheduled deployment batch. Please review the list of files below and chose "Continue" to cancel workflow and edit or "Cancel" to remain in your dashboard.';

  return (
    <>
      <DialogHeader
        id="workflowCancellationDialogTitle"
        title={title}
        subtitle={subtitle}
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
            <Button onClick={onClose} variant="outlined">
              <FormattedMessage id='workflowCancellationCancel' defaultMessage='Cancel' />
            </Button>
          )}
          {onContinue && (
            <Button onClick={onContinue} variant="contained" color="primary" autoFocus>
              <FormattedMessage id='workflowCancellationCancel' defaultMessage='Continue' />
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
    path,
    onClose,
    onClosed,
    onDismiss,
    onContinue
  } = props;
  useUnmount(props.onClosed);

  const siteId = useActiveSiteId();
  const [workflowAffectedFiles, setWorkflowAffectedFiles] = useState(null);
  const [error, setError] = useState(null);
  const authoringBase = useSelection(state => state.env.authoringBase);

  useEffect(() => {
    getWorkflowAffectedFiles(siteId, path).subscribe(
      (items) => {
        setWorkflowAffectedFiles(items);
      },
      (error) => {
        setError(error);
      }
    );
  }, [siteId, path]);

  const workflowCancellationSource = useMemo(() => ({
    workflowAffectedFiles,
    error
  }), [workflowAffectedFiles, error]);

  const resource = useLogicResource<Return, Source>(workflowCancellationSource, {
    shouldResolve: (source) => Boolean(source.workflowAffectedFiles),
    shouldReject: (source) => Boolean(source.error),
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => ({
      workflowAffectedFiles: source.workflowAffectedFiles
    }),
    errorSelector: (source) => source.error
  });

  const onContinueClick = () => {
    onDismiss();
    onContinue({
      src: `${authoringBase}/legacy/form?site=${siteId}&path=${path}&type=form`,
      type: 'form',
      inProgress: false,
      showTabs: false
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
