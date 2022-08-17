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

import { RenameAssetContainerProps } from './utils';
import { useEnhancedDialogContext } from '../EnhancedDialog';
import React, { useEffect, useState } from 'react';
import { DialogBody } from '../DialogBody';
import TextField from '@mui/material/TextField';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { fetchRenameAssetDependants, updateRenameAssetDialog } from '../../state/actions/dialogs';
import { cleanupAssetName, editorDisplay, getExtension, isEditableAsset } from '../../utils/content';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { DependenciesList } from '../DependenciesDialog';
import useItemsByPath from '../../hooks/useItemsByPath';
import { getParentPath } from '../../utils/path';
import { UNDEFINED } from '../../utils/constants';
import { isBlank } from '../../utils/string';
import SecondaryButton from '../SecondaryButton';
import { DialogFooter } from '../DialogFooter';
import PrimaryButton from '../PrimaryButton';
import { validateActionPolicy } from '../../services/sites';
import { ConfirmDialog } from '../ConfirmDialog';
import { renameContent } from '../../services/content';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { translations } from '../CreateFileDialog/translations';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import useSpreadState from '../../hooks/useSpreadState';
import { DetailedItem } from '../../models';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import useSelection from '../../hooks/useSelection';

export function RenameAssetDialogContainer(props: RenameAssetContainerProps) {
  const { onClose, onRenamed, path, value = '', allowBraces = false, type, dependantItems } = props;
  const { isSubmitting, hasPendingChanges } = useEnhancedDialogContext();
  const [name, setName] = useState(value);
  const dispatch = useDispatch();
  const itemLookupTable = useItemsByPath();
  const assetExtension = getExtension(type, path);
  const newAssetPath = `${getParentPath(path)}/${name}.${assetExtension}`;
  const assetExists = name !== value && itemLookupTable[newAssetPath] !== UNDEFINED;
  const isValid = !isBlank(name) && !assetExists && name !== value;
  const siteId = useActiveSiteId();
  const [confirm, setConfirm] = useState(null);
  const [confirmBrokenReferences, setConfirmBrokenReferences] = useState(false);
  const { formatMessage } = useIntl();
  const renameDisabled = isSubmitting || !isValid || (dependantItems.length > 0 && !confirmBrokenReferences);
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const [contextMenu, setContextMenu] = useSpreadState({
    el: null,
    dependency: null
  });

  const onInputChanges = (newValue: string) => {
    setName(newValue);
    const newHasPendingChanges = newValue !== value;
    hasPendingChanges !== newHasPendingChanges &&
      dispatch(updateRenameAssetDialog({ hasPendingChanges: newHasPendingChanges }));
  };

  const onRenameAsset = (siteId: string, path: string, name: string) => {
    renameContent(siteId, path, `${name}.${assetExtension}`).subscribe({
      next() {
        onRenamed?.({ path, name });
        dispatch(updateRenameAssetDialog({ isSubmitting: false, hasPendingChanges: false }));
      },
      error(response) {
        dispatch(showErrorDialog({ error: response }));
      }
    });
  };

  const onConfirmCancel = () => {
    setConfirm(null);
    dispatch(updateRenameAssetDialog({ isSubmitting: false }));
  };

  const onRename = () => {
    dispatch(updateRenameAssetDialog({ isSubmitting: true }));
    if (name) {
      validateActionPolicy(siteId, {
        type: 'RENAME',
        target: newAssetPath
      }).subscribe(({ allowed, modifiedValue }) => {
        if (allowed && modifiedValue) {
          setConfirm({
            body: formatMessage(translations.createPolicy, { name: modifiedValue.replace(`${path}/`, '') })
          });
        } else if (allowed) {
          onRenameAsset(siteId, path, name);
        } else {
          setConfirm({
            error: true,
            body: formatMessage(translations.policyError)
          });
        }
      });
    }
  };

  const handleContextMenuClick = (event: React.MouseEvent<HTMLButtonElement>, dependency: DetailedItem) => {
    console.log('dependency', dependency);
    setContextMenu({
      el: event.currentTarget,
      dependency
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu({
      el: null,
      dependency: null
    });
  };

  const handleEditorDisplay = (item: DetailedItem) => {
    editorDisplay(item, authoringBase, siteId, dispatch, fetchRenameAssetDependants());
  };

  useEffect(() => {
    if (path) {
      dispatch(fetchRenameAssetDependants());
    }
  }, [path, dispatch]);

  return (
    <>
      <DialogBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isValid) {
              onRename();
            }
          }}
        >
          <TextField
            fullWidth
            label={<FormattedMessage id="renameAsset.rename" defaultMessage="Provide a new asset name" />}
            value={name}
            autoFocus
            required
            helperText={
              assetExists ? (
                <FormattedMessage
                  id="renameAsset.assetAlreadyExists"
                  defaultMessage="An asset with that name already exists."
                />
              ) : !name && isSubmitting ? (
                <FormattedMessage id="renameAsset.assetNameRequired" defaultMessage="Asset name is required." />
              ) : (
                <FormattedMessage
                  id="renameAsset.helperText"
                  defaultMessage="Consisting of letters, numbers, dot (.), dash (-) and underscore (_)."
                />
              )
            }
            disabled={isSubmitting}
            margin="normal"
            InputLabelProps={{
              shrink: true
            }}
            onChange={(event) => onInputChanges(cleanupAssetName(event.target.value, allowBraces))}
          />
        </form>
        {dependantItems.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
              <FormattedMessage id="renameAsset.dependentItems" defaultMessage="Dependent Items" />
            </Typography>
            <DependenciesList
              dependencies={dependantItems}
              compactView={false}
              showTypes="all-deps"
              handleContextMenuClick={handleContextMenuClick}
            />
            <Menu open={Boolean(contextMenu.el)} anchorEl={contextMenu.el} keepMounted onClose={handleContextMenuClose}>
              {contextMenu.dependency && isEditableAsset(contextMenu.dependency.path) && (
                <MenuItem onClick={() => handleEditorDisplay(contextMenu.dependency)}>
                  <FormattedMessage id="words.edit" defaultMessage="Edit" />
                </MenuItem>
              )}
            </Menu>
            <FormGroup>
              <FormControlLabel
                sx={{ mt: 2 }}
                control={
                  <Checkbox
                    checked={confirmBrokenReferences}
                    onChange={() => setConfirmBrokenReferences(!confirmBrokenReferences)}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                }
                label={
                  <FormattedMessage
                    id="renameAsset.confirmBrokenReferences"
                    defaultMessage="I understand that there will be broken references"
                  />
                }
              />
            </FormGroup>
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={(e) => onClose(e, null)} disabled={isSubmitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={onRename} disabled={renameDisabled} loading={isSubmitting}>
          <FormattedMessage id="words.rename" defaultMessage="Rename" />
        </PrimaryButton>
      </DialogFooter>
      <ConfirmDialog
        open={Boolean(confirm)}
        body={confirm?.body}
        onOk={confirm?.error ? onConfirmCancel : () => onRenameAsset(siteId, path, name)}
        onCancel={confirm?.error ? null : onConfirmCancel}
      />
    </>
  );
}
