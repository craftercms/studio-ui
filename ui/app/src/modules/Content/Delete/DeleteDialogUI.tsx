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
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Item } from '../../../models/Item';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import { palette } from '../../../styles/theme';
import { DependencySelectionDelete } from '../Dependencies/DependencySelection';
import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import ErrorState from '../../../components/SystemStatus/ErrorState';

const deleteDialogStyles = makeStyles((theme) => createStyles({
  root: {
    textAlign: 'left'
  },
  titleRoot: {
    margin: 0,
    padding: '13px 20px 11px',
    background: palette.white
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10
  },
  subtitle: {
    fontSize: '14px',
    lineHeight: '18px',
    paddingRight: '35px'
  },
  dialogContent: {
    padding: theme.spacing(2),
    backgroundColor: palette.gray.light0,
    flex: '1 1 auto',
    overflowY: 'auto',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
  },
  submissionCommentField: {
    marginTop: '20px',
    '& .MuiTextField-root': {
      width: '100%'
    }
  },
  dialogActions: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    margin: 0,
    padding: theme.spacing(2),
    '& > :not(:first-child)': {
      marginLeft: '8px'
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

interface DeleteDialogUIProps {
  items: Item[];
  setSelectedItems: Function;
  submissionComment: string;
  setSubmissionComment: Function;
  open: boolean;
  apiState: any;
  handleClose: any;
  handleSubmit: any;
  handleErrorBack: any;

  onClose?(response?: any): any;
}

function DeleteDialogUI(props: DeleteDialogUIProps) {
  const {
    items,
    setSelectedItems,
    submissionComment,
    setSubmissionComment,
    open,
    apiState,
    handleClose,
    handleSubmit,
    handleErrorBack,
    onClose
  } = props;
  const classes = deleteDialogStyles({});

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      fullWidth={true}
      maxWidth={'sm'}
      className={classes.root}
    >
      {
        (!apiState.error) ?
          (
            <>
              {/* TODO: this dialog title is the same as the one used in PublishDialog and can be reused, move to a global component? */}
              <MuiDialogTitle disableTypography className={classes.titleRoot}>
                <div className={classes.title}>
                  <Typography variant="h6">
                    <FormattedMessage
                      id="deleteDialog.headerTitle"
                      defaultMessage="Delete"
                    />
                  </Typography>
                  {onClose ? (
                    <IconButton aria-label="close" onClick={onClose}>
                      <CloseIcon/>
                    </IconButton>
                  ) : null}
                </div>
                <Typography variant="subtitle1" className={classes.subtitle}>
                  <FormattedMessage
                    id="deleteDialog.headerSubTitle"
                    defaultMessage="Selected items will be deleted along with their items. Please review dependent items before deleting as these will end-up with broken link references."
                  />
                </Typography>
              </MuiDialogTitle>
              <div className={classes.dialogContent}>
                <DependencySelectionDelete
                  items={items}
                  siteId={'editorial'}
                  onChange={(result) => {
                    setSelectedItems(result);
                  }}
                />
                <form className={classes.submissionCommentField} noValidate autoComplete="off">
                  <TextField
                    id="outlined-multiline-static"
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
              </div>
              <div className={classes.dialogActions}>
                <Button variant="contained" onClick={handleClose} disabled={apiState.submitting}>
                  <FormattedMessage
                    id="deleteDialog.cancel"
                    defaultMessage={`Cancel`}
                  />
                </Button>
                <Button variant="contained" autoFocus onClick={handleSubmit} color="primary"
                        disabled={apiState.submitting}>
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
                          defaultMessage={`Delete`}
                        />
                      )
                  }
                </Button>
              </div>
            </>
          ) : (
            <ErrorState
              classes={{ root: classes.errorPaperRoot }}
              error={apiState.errorResponse}
              onBack={handleErrorBack}
            />
          )
      }
    </Dialog>
  )
}

export default DeleteDialogUI;
