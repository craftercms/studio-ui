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
import { LegacyItem } from '../../../models/Item';
import { deleteItems } from '../../../services/content';
import { useActiveSiteId, useActiveUser, useSpreadState, useStateResource } from '../../../utils/hooks';
import { fetchDeleteDependencies } from '../../../services/dependencies';
import { DeleteDependencies, DependencySelectionDelete } from '../Dependencies/DependencySelection';
import StandardAction from '../../../models/StandardAction';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { palette } from '../../../styles/theme';
import { Resource } from '../../../models/Resource';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../../../components/DialogHeader';
import DialogBody from '../../../components/DialogBody';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import DialogFooter from '../../../components/DialogFooter';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

const translations = defineMessages({
  headerTitle: {
    id: 'deleteDialog.headerTitle',
    defaultMessage: 'Delete'
  },
  headerSubTitle: {
    id: 'deleteDialog.headerSubTitle',
    defaultMessage: 'Selected items will be deleted along with their child items. Please review dependent items before deleting as these will end-up with broken link references.'
  }
});

const deleteDialogStyles = makeStyles((theme) => createStyles({
  root: {
    textAlign: 'left'
  },
  dialogContent: {
    minHeight: '388px'
  },
  submissionCommentField: {
    marginTop: '20px',
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
    backgroundColor: palette.white,
    padding: 0
  },
  errorPaperRoot: {
    maxHeight: '586px',
    height: '100vh',
    padding: 0
  }
}));

interface DeleteDialogContentUIProps {
  resource: Resource<DeleteDependencies>;
  items: LegacyItem[];
  submissionComment: string;
  setSubmissionComment: Function;

  onSelectionChange?: Function;
}

function DeleteDialogContentUI(props: DeleteDialogContentUIProps) {
  const {
    resource,
    items,
    submissionComment,
    setSubmissionComment,
    onSelectionChange
  } = props;
  const classes = deleteDialogStyles({});
  const deleteDependencies: DeleteDependencies = resource.read();

  return (
    <>
      <DependencySelectionDelete
        items={items}
        resultItems={deleteDependencies}
        onChange={(result) => onSelectionChange?.(result)}
      />
      <form className={classes.submissionCommentField} noValidate autoComplete="off">
        <TextField
          label={
            <FormattedMessage
              id="deleteDialog.submissionCommentLabel"
              defaultMessage="Submission Comment"
            />
          }
          multiline
          rows="4"
          defaultValue={submissionComment}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSubmissionComment(e.target.value)
          }}
          InputProps={{
            className: classes.textField
          }}
        />
      </form>
    </>
  )
}

interface DeleteDialogUIProps {
  resource: Resource<DeleteDependencies>;
  items: LegacyItem[];
  selectedItems: LegacyItem[];
  submissionComment: string;
  setSubmissionComment: Function;
  open: boolean;
  apiState: any;
  handleClose: any;
  handleSubmit: any;

  onSelectionChange?(selection?: any): any;

  onClose?(response?: any): any;
}

function DeleteDialogUI(props: DeleteDialogUIProps) {
  const {
    resource,
    items,
    selectedItems,
    submissionComment,
    setSubmissionComment,
    open,
    apiState,
    handleClose,
    handleSubmit,
    onSelectionChange,
    onClose
  } = props;
  const classes = deleteDialogStyles({});
  const { formatMessage } = useIntl();

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth='sm'
      className={classes.root}
    >
      <DialogHeader
        title={formatMessage(translations.headerTitle)}
        subtitle={formatMessage(translations.headerSubTitle)}
        onClose={onClose}
      />
      <DialogBody className={classes.dialogContent}>
        <SuspenseWithEmptyState
          resource={resource}
        >
          <DeleteDialogContentUI
            resource={resource}
            items={items}
            submissionComment={submissionComment}
            setSubmissionComment={setSubmissionComment}
            onSelectionChange={onSelectionChange}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <Button variant="contained" onClick={handleClose} disabled={apiState.submitting}>
          <FormattedMessage
            id="deleteDialog.cancel"
            defaultMessage={'Cancel'}
          />
        </Button>
        <Button
          variant="contained"
          autoFocus
          onClick={handleSubmit}
          color="primary"
          disabled={apiState.submitting || selectedItems.length === 0}
        >
          {
            apiState.submitting ?
              (
                <CircularProgress
                  className={classes.btnSpinner}
                  size={20}
                />
              ) : (
                <FormattedMessage
                  id="deleteDialog.submit"
                  defaultMessage={'Delete'}
                />
              )
          }
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

interface DeleteDialogBaseProps {
  open: boolean;
  items?: LegacyItem[];
}

export type DeleteDialogProps = PropsWithChildren<DeleteDialogBaseProps & {
  onClose(): any;
  onSuccess?(response?: any): any;
  }
>;

export interface DeleteDialogStateProps extends DeleteDialogBaseProps {
  onClose?: StandardAction;
  onSuccess?: StandardAction;
}

function DeleteDialog(props: DeleteDialogProps) {
  const {
    open,
    items,
    onClose,
    onSuccess
  } = props;
  const [submissionComment, setSubmissionComment] = useState('');
  const [apiState, setApiState] = useSpreadState({
    error: null,
    submitting: false
  });
  const user = useActiveUser();
  const siteId = useActiveSiteId();
  //Dependency selection
  const [deleteDependencies, setDeleteDependencies] = useState<DeleteDependencies>();
  const [selectedItems, setSelectedItems] = useState([]);

  const depsSource = useMemo(() => {
    return { deleteDependencies, apiState }
  }, [deleteDependencies, apiState]);

  const resource = useStateResource<any, any>(
    depsSource,
    {
      shouldResolve: (source) => Boolean(source.deleteDependencies),
      shouldReject: (source) => Boolean(source.apiState.error),
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: (source) => source.deleteDependencies,
      errorSelector: (source) => source.apiState.error
    }
  );

  useEffect(() => {
    fetchDeleteDependencies(siteId, selectedItems).subscribe(
      (response: any) => {
        setDeleteDependencies({
          childItems: response.items.childItems,
          dependentItems: response.items.dependentItems
        });
      },
      (error) => {
        setApiState({ error });
      }
    );
  }, [selectedItems, setApiState, siteId]);

  const handleClose = () => {
    // call externalClose fn
    onClose?.();
  };

  const handleSubmit = () => {
    const data = {
      items: selectedItems
    };

    setApiState({ submitting: true });

    deleteItems(siteId, user.username, submissionComment, data).subscribe(
      (response) => {
        setApiState({ submitting: false });
        onSuccess?.(response);
      },
      (error) => {
        setApiState({ error });
      }
    );

  };

  const onSelectionChange = (selection: LegacyItem[]) => {
    setSelectedItems(selection);
  };

  return (
    <DeleteDialogUI
      resource={resource}
      items={items}
      selectedItems={selectedItems}
      submissionComment={submissionComment}
      setSubmissionComment={setSubmissionComment}
      open={open}
      apiState={apiState}
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      onSelectionChange={onSelectionChange}
      onClose={onClose}
    />
  )
}

export default DeleteDialog;
