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
import { DeletePluginDialogBodyProps } from './utils';
import { useEffect, useState } from 'react';
import DialogBody from '../Dialogs/DialogBody';
import EmptyState from '../SystemStatus/EmptyState';
import { FormattedMessage } from 'react-intl';
import Alert from '@mui/material/Alert';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import LoadingState from '../SystemStatus/LoadingState';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { ListItem, ListItemText, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ItemDisplay from '../ItemDisplay';

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      background: theme.palette.background.paper
    },
    semiBold: {
      fontWeight: 600
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

export function DeletePluginDialogBody(props: DeletePluginDialogBodyProps) {
  const { onCloseButtonClick, resource, pluginId, onSubmit: onSubmitProp, password = 'delete', submitting } = props;
  const data = resource.read();
  const hasUsages = data.length > 0;
  const [confirmPasswordPassed, setConfirmPasswordPassed] = useState(false);
  const [passwordFieldValue, setPasswordFieldValue] = useState('');
  const classes = useStyles();
  useEffect(() => {
    setConfirmPasswordPassed(passwordFieldValue.toLowerCase() === password.toLowerCase());
  }, [password, passwordFieldValue]);
  const onSubmit = (e) => {
    e.preventDefault();
    if (confirmPasswordPassed || !hasUsages) {
      onSubmitProp?.();
    }
  };

  return (
    <>
      <DialogBody>
        {hasUsages ? (
          <>
            <Alert variant="outlined" severity="warning" icon={false}>
              <FormattedMessage
                id="deletePluginDialog.reviewDependenciesMessage"
                defaultMessage={'Please review the dependant items of "{pluginId}"'}
                values={{
                  pluginId
                }}
              />
            </Alert>
            <List>
              {data.map((item) => (
                <ListItem key={item.id} divider className={classes.content}>
                  <ListItemText
                    primary={<ItemDisplay item={item} showNavigableAsLinks={false} />}
                    secondary={<Typography variant="body2" color="textSecondary" children={item.path} />}
                  />
                </ListItem>
              ))}
            </List>
            <Alert severity="warning">
              <FormattedMessage
                id="deletePluginDialog.typePassword"
                defaultMessage={'Type the word "<b>{password}</b>" to confirm the deletion of the plugin.'}
                values={{
                  password,
                  b: (message) => {
                    return <strong className={classes.semiBold}>{message}</strong>;
                  }
                }}
              />
              <TextField
                fullWidth
                disabled={submitting}
                value={passwordFieldValue}
                onChange={(e) => setPasswordFieldValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSubmit(e)}
              />
            </Alert>
          </>
        ) : (
          <div>
            <EmptyState title="No usages found" subtitle="The plugin can be safely deleted." />
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} autoFocus disabled={submitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton disabled={(hasUsages && !confirmPasswordPassed) || submitting} onClick={onSubmit}>
          <FormattedMessage id="deletePluginDialog.submitButton" defaultMessage="Delete" />
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

export default DeletePluginDialogBody;
