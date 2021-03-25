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

import * as React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import ContentType from '../../models/ContentType';
import { Resource } from '../../models/Resource';
import { FetchContentTypeUsageResponse } from '../../services/contentTypes';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import EmptyState from '../SystemStatus/EmptyState';
import Alert from '@material-ui/lab/Alert';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import { ListItem, ListItemText, TextField } from '@material-ui/core';
import ItemDisplay from '../ItemDisplay';
import Typography from '@material-ui/core/Typography';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import LoadingState from '../SystemStatus/LoadingState';

export interface DeleteContentTypeDialogBodyProps {
  submitting: boolean;
  contentType: ContentType;
  resource: Resource<FetchContentTypeUsageResponse>;
  password?: string;
  onClose?(): void;
  onSubmit(): void;
}

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

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      background: '#fff'
    },
    preListMessageWrapper: {
      padding: '8px 15px'
    },
    semiBold: {
      fontWeight: 600
    },
    confirmationInput: {
      marginTop: '1em'
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
  })
);

function DeleteContentTypeDialogBody(props: DeleteContentTypeDialogBodyProps) {
  const classes = useStyles();
  const { onClose, resource, contentType, onSubmit: onSubmitProp, password = 'delete', submitting } = props;
  const data = resource.read();
  const { formatMessage } = useIntl();
  const dataEntries = Object.entries(data);
  const entriesWithItems = dataEntries.filter(([, items]) => items.length > 0);
  const noUsages = entriesWithItems.length === 0;
  const hasUsages = !noUsages;
  const [confirmPasswordPassed, setConfirmPasswordPassed] = useState(false);
  const [passwordFieldValue, setPasswordFieldValue] = useState('');
  useEffect(() => {
    setConfirmPasswordPassed(passwordFieldValue === password);
  }, [password, passwordFieldValue]);
  const onSubmit = (e) => {
    e.preventDefault();
    if (confirmPasswordPassed || noUsages) {
      onSubmitProp?.();
    }
  };
  return (
    <form onSubmit={onSubmit}>
      <DialogHeader
        title={<FormattedMessage id="deleteContentTypeDialog.headerTitle" defaultMessage="Delete Content Type" />}
        subtitle={
          <FormattedMessage
            id="deleteContentTypeDialog.headerSubtitle"
            defaultMessage={`Please confirm the deletion of "{name}"`}
            values={{ name: contentType.name }}
          />
        }
        onDismiss={onClose}
        disableDismiss={submitting}
      />
      <DialogBody>
        {noUsages ? (
          <div className={classes.content}>
            <EmptyState title="No usages found" subtitle="The content type can be safely deleted." />
          </div>
        ) : (
          <>
            <Alert variant="outlined" severity="warning" className={classes.topAlert} icon={false}>
              <FormattedMessage
                id="deleteContentTypeDialog.reviewDependenciesMessage"
                defaultMessage="Please review and confirm all of content type dependencies that will be deleted."
              />
            </Alert>
            <div>
              {entriesWithItems.map(([type, items]) => (
                <List
                  key={type}
                  subheader={
                    <ListSubheader className={classes.content} disableSticky>
                      {messages[type] ? formatMessage(messages[type]) : type}
                    </ListSubheader>
                  }
                >
                  {items.map((item) => (
                    <ListItem key={item.path} divider className={classes.content}>
                      <ListItemText
                        primary={<ItemDisplay item={item} showNavigableAsLinks={false} />}
                        secondary={<Typography variant="body2" color="textSecondary" children={item.path} />}
                      />
                    </ListItem>
                  ))}
                </List>
              ))}
            </div>
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
              />
            </Alert>
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose} autoFocus disabled={submitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton disabled={(hasUsages && !confirmPasswordPassed) || submitting} type="submit">
          <FormattedMessage id="deleteContentTypeDialog.submitButton" defaultMessage="Delete" />
        </PrimaryButton>
      </DialogFooter>
      {submitting && (
        <div className={classes.loadingStateWrapper}>
          <LoadingState />
        </div>
      )}
    </form>
  );
}

export default DeleteContentTypeDialogBody;
