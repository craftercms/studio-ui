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
import { CreateFolderContainerProps } from './utils';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { FormattedMessage, useIntl } from 'react-intl';
import { DetailedItem, SandboxItem } from '../../models/Item';
import { getParentPath, getRootPath, withoutIndex } from '../../utils/path';
import { createFolder, fetchSandboxItem, renameFolder } from '../../services/content';
import { batchActions } from '../../state/actions/misc';
import { updateCreateFolderDialog } from '../../state/actions/dialogs';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { validateActionPolicy } from '../../services/sites';
import { translations } from './translations';
import DialogBody from '../DialogBody/DialogBody';
import SingleItemSelector from '../SingleItemSelector';
import TextField from '@mui/material/TextField';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import useItemsByPath from '../../hooks/useItemsByPath';
import { UNDEFINED } from '../../utils/constants';
import { isBlank } from '../../utils/string';
import { useEnhancedDialogContext } from '../EnhancedDialog';
import { applyFolderNameRules, lookupItemByPath } from '../../utils/content';
import { useFetchItem } from '../../hooks/useFetchItem';
import ApiResponse from '../../models/ApiResponse';

export function CreateFolderContainer(props: CreateFolderContainerProps) {
  const { onClose, onCreated, onRenamed, rename = false, value = '', allowBraces = false } = props;
  const { isSubmitting, hasPendingChanges } = useEnhancedDialogContext();
  const [name, setName] = useState(value);
  const [confirm, setConfirm] = useState(null);
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const [openSelector, setOpenSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DetailedItem>(null);
  const path = useMemo(() => {
    return selectedItem ? withoutIndex(selectedItem.path) : withoutIndex(props.path);
  }, [props.path, selectedItem]);
  // When folder name changes, path prop will still be the previous one, and useDetailedItem will try to re-fetch the
  // non-existing item (old folder name path), so we will only re-fetch when the actual path prop of the component
  // changes (useDetailedItemNoState).
  const item = useFetchItem(path);
  const itemLookupTable = useItemsByPath();
  const newFolderPath = `${rename ? getParentPath(path) : path}/${name}`;
  // When calling the validation API, we need to check if the item with the suggested name exists. This is an extra validation for the
  // folderExists const.
  const [itemExists, setItemExists] = useState(false);
  const folderExists = rename
    ? name !== value && (itemExists || lookupItemByPath(newFolderPath, itemLookupTable) !== UNDEFINED)
    : itemExists || lookupItemByPath(newFolderPath, itemLookupTable) !== UNDEFINED;
  const isValid = !isBlank(name) && !folderExists && (!rename || name !== value);

  useEffect(() => {
    if (item && rename === false) {
      setSelectedItem(item);
    }
  }, [item, rename]);

  const onError = (error: ApiResponse) => {
    dispatch(
      batchActions([
        showErrorDialog({ error }),
        updateCreateFolderDialog({
          isSubmitting: false
        })
      ])
    );
  };

  const onRenameFolder = (site: string, path: string, name: string) => {
    renameFolder(site, path, name).subscribe({
      next() {
        onRenamed?.({ path, name, rename });
        dispatch(updateCreateFolderDialog({ isSubmitting: false, hasPendingChanges: false }));
      },
      error: onError
    });
  };

  const onCreateFolder = (site: string, path: string, name: string) => {
    createFolder(site, path, name).subscribe({
      next() {
        onCreated?.({ path, name, rename });
        dispatch(updateCreateFolderDialog({ isSubmitting: false, hasPendingChanges: false }));
      },
      error: onError
    });
  };

  const onSubmit = () => {
    dispatch(updateCreateFolderDialog({ isSubmitting: true }));
    if (name) {
      const parentPath = rename ? getParentPath(path) : path;
      validateActionPolicy(site, {
        type: rename ? 'RENAME' : 'CREATE',
        target: `${parentPath}/${name}`
      }).subscribe({
        next: ({ allowed, modifiedValue, message }) => {
          if (allowed) {
            const pathToCheckExists = modifiedValue ?? `${parentPath}/${name}`;
            setItemExists(false);
            fetchSandboxItem(site, pathToCheckExists).subscribe({
              next: (item) => {
                if (item) {
                  setItemExists(true);
                  dispatch(updateCreateFolderDialog({ isSubmitting: false }));
                } else {
                  if (modifiedValue) {
                    setConfirm({ body: message });
                  } else {
                    if (rename) {
                      onRenameFolder(site, path, name);
                    } else {
                      onCreateFolder(site, path, name);
                    }
                  }
                }
              },
              error: onError
            });
          } else {
            setConfirm({
              error: true,
              body: formatMessage(translations.policyError, { fileName: name, detail: message })
            });
            dispatch(updateCreateFolderDialog({ isSubmitting: false }));
          }
        },
        error: onError
      });
    }
  };

  const onConfirm = () => {
    if (rename) {
      onRenameFolder(site, path, name);
    } else {
      onCreateFolder(site, path, name);
    }
  };

  const onConfirmCancel = () => {
    setConfirm(null);
    dispatch(updateCreateFolderDialog({ isSubmitting: false }));
  };

  const onInputChanges = (newValue: string) => {
    setName(newValue);
    setItemExists(false);
    const newHasPendingChanges = rename ? newValue !== value : !isBlank(newValue);
    hasPendingChanges !== newHasPendingChanges &&
      dispatch(updateCreateFolderDialog({ hasPendingChanges: newHasPendingChanges }));
  };

  const itemSelectorFilterChildren = useMemo(() => (item: SandboxItem) => item.availableActionsMap.createFolder, []);

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <>
      <DialogBody>
        {selectedItem && (
          <SingleItemSelector
            label={<FormattedMessage id="words.location" defaultMessage="Location" />}
            open={openSelector}
            onClose={() => setOpenSelector(false)}
            onDropdownClick={() => setOpenSelector(!openSelector)}
            rootPath={getRootPath(path)}
            selectedItem={selectedItem}
            canSelectFolders
            onItemClicked={(item) => {
              setOpenSelector(false);
              setSelectedItem(item);
            }}
            filterChildren={itemSelectorFilterChildren}
          />
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isValid) {
              onSubmit();
            }
          }}
        >
          <TextField
            fullWidth
            label={
              rename ? (
                <FormattedMessage id="newFolder.rename" defaultMessage="Provide a new folder name" />
              ) : (
                <FormattedMessage id="newFolder.folderName" defaultMessage="Folder Name" />
              )
            }
            value={name}
            autoFocus
            required
            error={(!name && isSubmitting !== null) || folderExists}
            placeholder={formatMessage(translations.placeholder)}
            helperText={
              folderExists ? (
                <FormattedMessage
                  id="newFolder.folderAlreadyExists"
                  defaultMessage="A folder with that name already exists"
                />
              ) : !name && isSubmitting !== null ? (
                <FormattedMessage id="newFolder.required" defaultMessage="Folder name is required." />
              ) : (
                <FormattedMessage
                  id="newFolder.helperText"
                  defaultMessage="Consisting of: letters, numbers, dash (-) and underscore (_)."
                />
              )
            }
            disabled={isSubmitting}
            margin="normal"
            InputLabelProps={{
              shrink: true
            }}
            onChange={(event) => onInputChanges(applyFolderNameRules(event.target.value, { allowBraces }))}
          />
        </form>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} disabled={isSubmitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={onSubmit} disabled={isSubmitting || !isValid} loading={isSubmitting}>
          {rename ? (
            <FormattedMessage id="words.rename" defaultMessage="Rename" />
          ) : (
            <FormattedMessage id="words.create" defaultMessage="Create" />
          )}
        </PrimaryButton>
      </DialogFooter>
      <ConfirmDialog
        open={Boolean(confirm)}
        body={confirm?.body}
        onOk={confirm?.error ? onConfirmCancel : onConfirm}
        onCancel={confirm?.error ? null : onConfirmCancel}
      />
    </>
  );
}

export default CreateFolderContainer;
