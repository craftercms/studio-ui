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

import React, { PropsWithChildren, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from './DialogHeader';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import TextField from '@material-ui/core/TextField';
import { createFolder, renameFolder } from '../../services/content';
import { useActiveSiteId, useUnmount } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import CircularProgress from '@material-ui/core/CircularProgress';
import StandardAction from '../../models/StandardAction';
import { emitSystemEvent, folderCreated, folderRenamed } from '../../state/actions/system';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { validateActionPolicy } from '../../services/sites';
import { getParentPath } from '../../utils/path';
import ConfirmDialog from './ConfirmDialog';

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
  const { open, onClose } = props;
  const [state, setState] = useState({
    submitted: null,
    inProgress: null
  });
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth={'xs'}
      onClose={onClose}
      onEscapeKeyDown={onClose}
      onExited={() => setState({ inProgress: null, submitted: null })}
    >
      <CreateFolderUI {...props} submitted={state.submitted} inProgress={state.inProgress} setState={setState} />
    </Dialog>
  );
}

interface CreateFolderUIProps extends CreateFolderProps {
  submitted: boolean;
  inProgress: boolean;
  setState(values: object): void;
}

function CreateFolderUI(props: CreateFolderUIProps) {
  const {
    onClosed,
    onClose,
    path,
    submitted,
    inProgress,
    setState,
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

  useUnmount(onClosed);

  const onRenameFolder = (site: string, path: string, name: string) => {
    renameFolder(site, path, name).subscribe(
      (response) => {
        onRenamed?.({ path, name, rename });
        dispatch(emitSystemEvent(folderRenamed({ target: path, oldName: value, newName: name })));
      },
      (response) => {
        setState({ inProgress: false, submitted: true });
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCreateFolder = (site: string, path: string, name: string) => {
    createFolder(site, path, name).subscribe(
      (response) => {
        onCreated?.({ path, name, rename });
        dispatch(emitSystemEvent(folderCreated({ target: path, name: name })));
      },
      (response) => {
        setState({ inProgress: false, submitted: true });
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCreate = () => {
    setState({ inProgress: true, submitted: true });

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
    setState({ inProgress: false, submitted: true });
  };

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
        onDismiss={inProgress === null ? onClose : null}
      />
      <DialogBody>
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
            error={!name && submitted}
            placeholder={formatMessage(translations.placeholder)}
            helperText={
              !name && submitted ? (
                <FormattedMessage id="newFolder.required" defaultMessage="Folder name is required." />
              ) : (
                <FormattedMessage
                  id="newFolder.helperText"
                  defaultMessage="Consisting of: letters, numbers, dash (-) and underscore (_)."
                />
              )
            }
            disabled={inProgress}
            margin="normal"
            InputLabelProps={{
              shrink: true
            }}
            onChange={(event) =>
              setName(event.target.value.replace(allowBraces ? /[^a-zA-Z0-9-_{}]/g : /[^a-zA-Z0-9-_]/g, ''))
            }
          />
        </form>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose} disabled={inProgress}>
          <FormattedMessage id="words.close" defaultMessage="Close" />
        </SecondaryButton>
        <PrimaryButton onClick={onCreate} disabled={inProgress || name === ''}>
          {inProgress && <CircularProgress size={20} />}
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
