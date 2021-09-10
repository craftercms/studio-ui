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
import DialogHeader from './DialogHeader';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import TextField from '@material-ui/core/TextField';
import { createFolder, renameFolder } from '../../services/content';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import StandardAction from '../../models/StandardAction';
import { emitSystemEvent, folderCreated, folderRenamed } from '../../state/actions/system';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { validateActionPolicy } from '../../services/sites';
import { getParentPath, getRootPath, withoutIndex } from '../../utils/path';
import ConfirmDialog from './ConfirmDialog';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { useDetailedItem } from '../../utils/hooks/useDetailedItem';
import SingleItemSelector from '../../modules/Content/Authoring/SingleItemSelector';
import { DetailedItem, SandboxItem } from '../../models/Item';
import Dialog from '../Dialog';
import { updateCreateFolderDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';

export const translations = defineMessages({
  placeholder: {
    id: 'createFolder.placeholder',
    defaultMessage: 'Please type a folder name'
  },
  createPolicy: {
    id: 'createFolder.createPolicy',
    defaultMessage:
      'The supplied name goes against site policies. Suggested modified name is: "{name}". Would you like to use the suggested name?'
  },
  policyError: {
    id: 'createFolder.policyError',
    defaultMessage: 'The supplied name goes against site policies.'
  }
});

interface CreateFolderBaseProps {
  open: boolean;
  path?: string;
  rename?: boolean;
  value?: string;
  allowBraces?: boolean;
  isSubmitting: boolean;
  hasPendingChanges: boolean;
}

export type CreateFolderProps = PropsWithChildren<
  CreateFolderBaseProps & {
    onClose(): void;
    onClosed?(): void;
    onCreated?(response: { path: string; name: string; rename: boolean }): void;
    onRenamed?(response: { path: string; name: string; rename: boolean }): void;
  }
>;

export interface CreateFolderStateProps extends CreateFolderBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onCreated?: StandardAction;
  onRenamed?: StandardAction;
}

export default function CreateFolderDialog(props: CreateFolderProps) {
  const { open, onClose, isSubmitting, hasPendingChanges, ...rest } = props;

  return (
    <Dialog
      open={open}
      maxWidth={'xs'}
      onClose={onClose}
      isSubmitting={isSubmitting}
      hasPendingChanges={hasPendingChanges}
    >
      <CreateFolderContainer {...rest} onClose={onClose} isSubmitting={isSubmitting} />
    </Dialog>
  );
}

interface CreateFolderContainerProps
  extends Pick<
    CreateFolderProps,
    'path' | 'allowBraces' | 'value' | 'rename' | 'isSubmitting' | 'onRenamed' | 'onCreated' | 'onClose' | 'onClosed'
  > {}

function CreateFolderContainer(props: CreateFolderContainerProps) {
  const {
    onClosed,
    onClose,
    isSubmitting,
    onCreated,
    onRenamed,
    rename = false,
    value = '',
    allowBraces = false
  } = props;
  const [name, setName] = useState(value);
  const [confirm, setConfirm] = useState(null);
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const item = useDetailedItem(props.path);
  const [openSelector, setOpenSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DetailedItem>(null);
  const path = useMemo(() => {
    return selectedItem ? withoutIndex(selectedItem.path) : withoutIndex(props.path);
  }, [props.path, selectedItem]);

  useEffect(() => {
    if (item && rename === false) {
      setSelectedItem(item);
    }
  }, [item, rename]);

  useUnmount(onClosed);

  const onRenameFolder = (site: string, path: string, name: string) => {
    renameFolder(site, path, name).subscribe(
      (response) => {
        onRenamed?.({ path, name, rename });
        dispatch(
          batchActions([
            updateCreateFolderDialog({
              isSubmitting: true,
              hasPendingChanges: false
            }),
            emitSystemEvent(folderRenamed({ target: path, oldName: value, newName: name }))
          ])
        );
      },
      (response) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCreateFolder = (site: string, path: string, name: string) => {
    createFolder(site, path, name).subscribe(
      (response) => {
        onCreated?.({ path, name, rename });
        dispatch(
          batchActions([
            updateCreateFolderDialog({
              isSubmitting: true,
              hasPendingChanges: false
            }),
            emitSystemEvent(folderCreated({ target: path, name: name }))
          ])
        );
      },
      (response) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCreate = () => {
    dispatch(
      updateCreateFolderDialog({
        isSubmitting: true
      })
    );
    if (name) {
      const parentPath = rename ? getParentPath(path) : path;
      validateActionPolicy(site, {
        type: rename ? 'RENAME' : 'CREATE',
        target: `${parentPath}/${name}`
      }).subscribe(({ allowed, modifiedValue }) => {
        if (allowed && modifiedValue) {
          setConfirm({
            body: formatMessage(translations.createPolicy, { name: modifiedValue.replace(`${path}/`, '') })
          });
        } else if (allowed) {
          if (rename) {
            onRenameFolder(site, path, name);
          } else {
            onCreateFolder(site, path, name);
          }
        } else {
          setConfirm({
            error: true,
            body: formatMessage(translations.policyError)
          });
          dispatch(
            updateCreateFolderDialog({
              isSubmitting: false
            })
          );
        }
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
    dispatch(
      updateCreateFolderDialog({
        isSubmitting: false
      })
    );
  };

  const onInputChanges = (value: string) => {
    setName(value);
    dispatch(
      updateCreateFolderDialog({
        hasPendingChanges: true
      })
    );
  };

  const itemSelectorFilterChildren = useMemo(() => (item: SandboxItem) => item.availableActionsMap.createFolder, []);

  return (
    <>
      <DialogHeader
        title={
          rename ? (
            <FormattedMessage id="newFolder.title.rename" defaultMessage="Rename Folder" />
          ) : (
            <FormattedMessage id="newFolder.title" defaultMessage="Create a New Folder" />
          )
        }
        onCloseButtonClick={onClose}
      />
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
            onCreate();
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
            error={!name && isSubmitting !== null}
            placeholder={formatMessage(translations.placeholder)}
            helperText={
              !name && isSubmitting !== null ? (
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
            onChange={(event) =>
              onInputChanges(event.target.value.replace(allowBraces ? /[^a-zA-Z0-9-_{}]/g : /[^a-zA-Z0-9-_]/g, ''))
            }
          />
        </form>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose} disabled={isSubmitting}>
          <FormattedMessage id="words.close" defaultMessage="Close" />
        </SecondaryButton>
        <PrimaryButton onClick={onCreate} disabled={isSubmitting || name === ''} loading={isSubmitting}>
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
