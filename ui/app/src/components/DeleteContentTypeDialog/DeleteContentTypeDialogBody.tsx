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

import * as React from 'react';
import { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { FetchContentTypeUsageResponse } from '../../services/contentTypes';
import { makeStyles } from 'tss-react/mui';
import DialogBody from '../DialogBody/DialogBody';
import EmptyState from '../EmptyState/EmptyState';
import Alert from '@mui/material/Alert';
import { TextField } from '@mui/material';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import LoadingState from '../LoadingState/LoadingState';
import ContentTypeUsageReport from './ContentTypeUsageReport';
import { SandboxItem } from '../../models/Item';
import { DeleteContentTypeDialogBodyProps } from './utils';

const messages = defineMessages({
  content: {
    id: 'words.content',
    defaultMessage: 'Content'
  },
  templates: {
    id: 'words.templates',
    defaultMessage: 'Templates'
  },
  scripts: {
    id: 'words.scripts',
    defaultMessage: 'Scripts'
  }
});

const useStyles = makeStyles()((theme) => ({
  content: {
    background: theme.palette.background.paper
  },
  preListMessageWrapper: {
    padding: '8px 15px'
  },
  semiBold: {
    fontWeight: 600
  },
  confirmationInput: {
    marginTop: '1em',
    '& legend': {
      width: 0
    }
  },
  topAlert: {
    marginBottom: '1em'
  },
  bottomAlert: {
    marginBottom: '.5em'
  },
  loadingStateWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    background: 'rgba(255,255,255,0.7)'
  }
}));

export function DeleteContentTypeDialogBody(props: DeleteContentTypeDialogBodyProps) {
  const { classes } = useStyles();
  const { onCloseButtonClick, data, contentType, onSubmit: onSubmitProp, password = 'delete', submitting } = props;
  const { formatMessage } = useIntl();
  const dataEntries = Object.entries(data) as Array<[keyof FetchContentTypeUsageResponse, SandboxItem[]]>;
  const entriesWithItems = dataEntries.filter(([, items]) => items.length > 0);
  const noUsages = entriesWithItems.length === 0;
  const hasUsages = !noUsages;
  const [confirmPasswordPassed, setConfirmPasswordPassed] = useState(false);
  const [passwordFieldValue, setPasswordFieldValue] = useState('');
  useEffect(() => {
    setConfirmPasswordPassed(passwordFieldValue.toLowerCase() === password.toLowerCase());
  }, [password, passwordFieldValue]);
  const onSubmit = (e) => {
    e.preventDefault();
    if (confirmPasswordPassed || noUsages) {
      onSubmitProp?.();
    }
  };
  return (
    <>
      <DialogBody>
        {noUsages ? (
          <div className={classes.content}>
            <EmptyState
              title={<FormattedMessage id="deleteContentTypeDialog.noUsagesFound" defaultMessage="No usages found" />}
              subtitle={
                <FormattedMessage
                  id="deleteContentTypeDialog.safeToDelete"
                  defaultMessage="The content type can be safely deleted."
                />
              }
            />
          </div>
        ) : (
          <>
            <Alert variant="outlined" severity="warning" className={classes.topAlert} icon={false}>
              <FormattedMessage
                id="deleteContentTypeDialog.reviewDependenciesMessage"
                defaultMessage="Please review and confirm all of content type dependencies that will be deleted."
              />
            </Alert>
            <ContentTypeUsageReport
              classes={{ listHeader: classes.content, listItem: classes.content }}
              entries={entriesWithItems}
              messages={{
                content: formatMessage(messages.content),
                templates: formatMessage(messages.templates),
                scripts: formatMessage(messages.scripts)
              }}
            />
            <Alert severity="warning" className={classes.bottomAlert}>
              <FormattedMessage
                id="deleteContentTypeDialog.typeConfirmPassword"
                defaultMessage={`Type the word "<b>{password}</b>" to confirm the deletion of "{name}" and all it's dependencies.`}
                values={{
                  password,
                  name: contentType.name,
                  b: (message) => {
                    return <strong className={classes.semiBold}>{message}</strong>;
                  }
                }}
              />
              <TextField
                fullWidth
                disabled={submitting}
                className={classes.confirmationInput}
                value={passwordFieldValue}
                onChange={(e) => setPasswordFieldValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSubmit(e)}
              />
            </Alert>
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} autoFocus disabled={submitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton disabled={(hasUsages && !confirmPasswordPassed) || submitting} onClick={onSubmit}>
          <FormattedMessage id="deleteContentTypeDialog.submitButton" defaultMessage="Delete" />
        </PrimaryButton>
      </DialogFooter>
      {submitting && (
        <div className={classes.loadingStateWrapper}>
          <LoadingState />
        </div>
      )}
    </>
  );
}

export default DeleteContentTypeDialogBody;
