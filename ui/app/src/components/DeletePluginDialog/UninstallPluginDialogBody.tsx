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
import { useEffect, useState } from 'react';
import {
  UninstallPluginDialogBodyClassKey,
  UninstallPluginDialogBodyFullSx,
  UninstallPluginDialogBodyPartialSx,
  UninstallPluginDialogBodyProps
} from './utils';
import DialogBody from '../Dialogs/DialogBody';
import EmptyState from '../SystemStatus/EmptyState';
import { FormattedMessage } from 'react-intl';
import Alert from '@mui/material/Alert';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import LoadingState from '../SystemStatus/LoadingState';
import { Box, ListItem, ListItemText, styled, TextField, Theme } from '@mui/material';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ItemDisplay from '../ItemDisplay';
import { SxProps } from '@mui/system';

const Strong = styled('strong')``;

function getStyles(sx: UninstallPluginDialogBodyPartialSx): UninstallPluginDialogBodyFullSx {
  return {
    content: {
      background: (theme) => theme.palette.background.paper,
      ...sx?.content
    },
    semiBold: {
      fontWeight: 600,
      ...sx?.semiBold
    },
    loadingStateWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      background: 'rgba(255,255,255,0.7)',
      ...sx?.loadingStateWrapper
    }
  } as Record<UninstallPluginDialogBodyClassKey, SxProps<Theme>>;
}

export function UninstallPluginDialogBody(props: UninstallPluginDialogBodyProps) {
  const { onCloseButtonClick, resource, pluginId, onSubmit: onSubmitProp, password = 'uninstall', submitting } = props;
  const data = resource.read();
  const hasUsages = data.length > 0;
  const [confirmPasswordPassed, setConfirmPasswordPassed] = useState(false);
  const [passwordFieldValue, setPasswordFieldValue] = useState('');
  const sx = getStyles(props.sx);
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
                id="uninstallPluginDialog.reviewDependenciesMessage"
                defaultMessage={'Please review the dependant items of "{pluginId}"'}
                values={{
                  pluginId
                }}
              />
            </Alert>
            <List>
              {data.map((item) => (
                <ListItem key={item.id} divider sx={sx.content}>
                  <ListItemText
                    primary={<ItemDisplay item={item} showNavigableAsLinks={false} />}
                    secondary={<Typography variant="body2" color="textSecondary" children={item.path} />}
                  />
                </ListItem>
              ))}
            </List>
            <Alert severity="warning">
              <FormattedMessage
                id="uninstallPluginDialog.typePassword"
                defaultMessage={'Type the word "<b>{password}</b>" to confirm the deletion of the plugin.'}
                values={{
                  password,
                  b: (message) => {
                    return <Strong sx={sx.semiBold}>{message}</Strong>;
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
            <EmptyState title="No usages found" subtitle="The plugin can be safely uninstalled." />
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} autoFocus disabled={submitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton disabled={(hasUsages && !confirmPasswordPassed) || submitting} onClick={onSubmit}>
          <FormattedMessage id="uninstallPluginDialog.submitButton" defaultMessage="Uninstall" />
        </PrimaryButton>
      </DialogFooter>
      {submitting && (
        <Box sx={sx.loadingStateWrapper}>
          <LoadingState />
        </Box>
      )}
    </>
  );
}

export default UninstallPluginDialogBody;
