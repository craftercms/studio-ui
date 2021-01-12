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
import { SandboxItem } from '../../../models/Item';
import { useActiveSiteId, useLogicResource, useSpreadState, useUnmount } from '../../../utils/hooks';
import { DeleteDependencies, DependencySelectionDelete } from '../Dependencies/DependencySelection';
import StandardAction from '../../../models/StandardAction';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Resource } from '../../../models/Resource';
import DialogHeader from '../../../components/Dialogs/DialogHeader';
import DialogBody from '../../../components/Dialogs/DialogBody';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import DialogFooter from '../../../components/Dialogs/DialogFooter';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import palette from '../../../styles/palette';
import Grid from '@material-ui/core/Grid';
import TextFieldWithMax from '../../../components/Controls/TextFieldWithMax';
import { fetchDeleteDependencies, showEditDialog } from '../../../state/actions/dialogs';
import { useDispatch, useSelector } from 'react-redux';
import GlobalState from '../../../models/GlobalState';
import { deleteItems } from '../../../services/content';
import { emitSystemEvent, itemsDeleted } from '../../../state/actions/system';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { PrimaryButton } from '../../../components/PrimaryButton';

interface DeleteDialogContentUIProps {
  resource: Resource<DeleteDependencies>;
  items: SandboxItem[];
  submissionComment: string;
  setSubmissionComment: Function;
  onSelectionChange?: Function;
  onEditDependency?: Function;
}

interface DeleteDialogUIProps {
  resource: Resource<DeleteDependencies>;
  items: SandboxItem[];
  selectedItems: SandboxItem[];
  submissionComment: string;
  setSubmissionComment: Function;
  apiState: any;
  handleSubmit: any;
  onSelectionChange?(selection?: any): any;
  onClose?(): void;
  onDismiss?(): void;
  onEditDependency?: Function;
}

interface DeleteDialogBaseProps {
  open: boolean;
  items?: SandboxItem[];
  isFetching: boolean;
}

export type DeleteDialogProps = PropsWithChildren<
  DeleteDialogBaseProps & {
    onClose?(): any;
    onClosed?(): any;
    onDismiss?(): any;
    onSuccess?(response?: any): any;
  }
>;

export interface DeleteDialogStateProps extends DeleteDialogBaseProps {
  childItems: string[];
  dependentItems: string[];
  isFetching: boolean;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
  onSuccess?: StandardAction;
}

const translations = defineMessages({
  headerTitle: {
    id: 'deleteDialog.headerTitle',
    defaultMessage: 'Delete'
  },
  headerSubTitle: {
    id: 'deleteDialog.headerSubTitle',
    defaultMessage:
      'Selected items will be deleted along with their child items. Please review dependent items before deleting as these will end-up with broken link references.'
  }
});

const deleteDialogStyles = makeStyles((theme) =>
  createStyles({
    dialogBody: {
      overflow: 'auto',
      minHeight: '50vh'
    },
    submissionCommentField: {
      '& .MuiTextField-root': {
        width: '100%'
      }
    },
    btnSpinner: {
      marginLeft: 11,
      marginRight: 11,
      color: '#fff'
    },
    textField: {
      padding: 0
    },
    errorPaperRoot: {
      maxHeight: '586px',
      height: '100vh',
      padding: 0
    },
    depsContainer: {
      minHeight: '350px'
    },
    countContainer: {
      padding: '5px'
    },
    submissionCommentCount: {
      fontSize: '14px',
      color: palette.gray.medium4
    }
  })
);

function DeleteDialogContentUI(props: DeleteDialogContentUIProps) {
  const { resource, items, submissionComment, setSubmissionComment, onSelectionChange, onEditDependency } = props;
  const classes = deleteDialogStyles({});
  const deleteDependencies: DeleteDependencies = resource.read();

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={7} md={7} lg={7} xl={7} className={classes.depsContainer}>
          <DependencySelectionDelete
            items={items}
            resultItems={deleteDependencies}
            onChange={onSelectionChange}
            onEditDependency={onEditDependency}
          />
        </Grid>

        <Grid item xs={12} sm={5} md={5} lg={5} xl={5}>
          <form className={classes.submissionCommentField} noValidate autoComplete="off">
            <TextFieldWithMax
              label={<FormattedMessage id="deleteDialog.submissionCommentLabel" defaultMessage="Submission Comment" />}
              multiline
              rows="4"
              defaultValue={submissionComment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSubmissionComment(e.target.value);
              }}
              InputProps={{
                className: classes.textField
              }}
            />
          </form>
        </Grid>
      </Grid>
    </>
  );
}

function DeleteDialogUI(props: DeleteDialogUIProps) {
  const {
    resource,
    items,
    selectedItems,
    submissionComment,
    setSubmissionComment,
    apiState,
    handleSubmit,
    onSelectionChange,
    onDismiss,
    onEditDependency
  } = props;
  const classes = deleteDialogStyles({});
  const { formatMessage } = useIntl();
  return (
    <>
      <DialogHeader
        title={formatMessage(translations.headerTitle)}
        subtitle={formatMessage(translations.headerSubTitle)}
        onDismiss={onDismiss}
      />
      <DialogBody className={classes.dialogBody}>
        <SuspenseWithEmptyState resource={resource}>
          <DeleteDialogContentUI
            resource={resource}
            items={items}
            submissionComment={submissionComment}
            setSubmissionComment={setSubmissionComment}
            onSelectionChange={onSelectionChange}
            onEditDependency={onEditDependency}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onDismiss} disabled={apiState.submitting}>
          <FormattedMessage id="deleteDialog.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton
          autoFocus
          onClick={handleSubmit}
          disabled={apiState.submitting || !selectedItems || selectedItems.length === 0}
        >
          {apiState.submitting ? (
            <CircularProgress className={classes.btnSpinner} size={20} />
          ) : (
            <FormattedMessage id="deleteDialog.submit" defaultMessage={'Delete'} />
          )}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default function DeleteDialog(props: DeleteDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <DeleteDialogWrapper {...props} />
    </Dialog>
  );
}

function DeleteDialogWrapper(props: DeleteDialogProps) {
  const { items, onClose, onDismiss, onSuccess, isFetching } = props;
  const [submissionComment, setSubmissionComment] = useState('');
  const [apiState, setApiState] = useSpreadState({
    error: null,
    submitting: false
  });
  const siteId = useActiveSiteId();
  const deleteDependencies = useSelector<GlobalState, { childItems: string[]; dependentItems: string[] }>(
    (state) => state.dialogs.delete
  );

  const [selectedItems, setSelectedItems] = useState(null);
  const dispatch = useDispatch();

  const depsSource = useMemo(() => ({ deleteDependencies, apiState, isFetching }), [
    deleteDependencies,
    apiState,
    isFetching
  ]);
  useUnmount(props.onClosed);

  const resource = useLogicResource<any, any>(depsSource, {
    shouldResolve: (source) => Boolean(source.deleteDependencies && !source.isFetching),
    shouldReject: (source) => Boolean(source.apiState.error),
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source.deleteDependencies,
    errorSelector: (source) => source.apiState.error
  });

  useEffect(() => {
    if (selectedItems) {
      dispatch(fetchDeleteDependencies(selectedItems));
    }
  }, [dispatch, selectedItems, setApiState, siteId]);

  const onEditDependency = (src) => {
    dispatch(
      showEditDialog({
        src,
        onClosed: fetchDeleteDependencies(selectedItems)
      })
    );
  };

  const handleSubmit = () => {
    const data = {
      items: selectedItems
    };

    setApiState({ submitting: true });

    deleteItems(siteId, submissionComment, data).subscribe(
      (response) => {
        setApiState({ submitting: false });

        dispatch(emitSystemEvent(itemsDeleted({ targets: selectedItems })));

        onSuccess?.({
          ...response,
          items: selectedItems.map((path) => items.find((item) => item.id === path))
        });
      },
      (error) => {
        setApiState({ error });
      }
    );
  };

  return (
    <DeleteDialogUI
      resource={resource}
      items={items}
      selectedItems={selectedItems}
      submissionComment={submissionComment}
      setSubmissionComment={setSubmissionComment}
      apiState={apiState}
      handleSubmit={handleSubmit}
      onSelectionChange={setSelectedItems}
      onDismiss={onDismiss}
      onClose={onClose}
      onEditDependency={onEditDependency}
    />
  );
}
