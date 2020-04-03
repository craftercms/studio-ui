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

import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import CloseRoundedIcon from '@material-ui/icons/Close';
import { Item } from '../../../models/Item';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { palette } from '../../../styles/theme';
import { DependencySelectionDelete, DeleteDependencies } from '../Dependencies/DependencySelection';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogHeader from '../../../components/DialogHeader';
import DialogBody from '../../../components/DialogBody';
import DialogFooter from '../../../components/DialogFooter';
import { Resource } from '../../../models/Resource';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';

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
  items: Item[];
  submissionComment: string;
  setSubmissionComment: Function;

  onSelectionChange?: Function;
};

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
  items: Item[];
  selectedItems: Item[];
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
        icon={CloseRoundedIcon}
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

export default DeleteDialogUI;
