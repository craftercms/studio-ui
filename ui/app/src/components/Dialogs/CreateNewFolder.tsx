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

import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from './DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { createNewFolder, renameFolder } from '../../services/content';
import { useActiveSiteId } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import CircularProgress from '@material-ui/core/CircularProgress';

interface CreateNewFolderProps {
  open: boolean;
  path?: string;
  rename?: boolean;
  value?: string;
  onClose(): void;
  onClosed?(): void;
  onCreated?(path: string, name: string, rename: boolean): void;
}

export default function (props: CreateNewFolderProps) {
  const { open, onClose, onClosed } = props;
  const [state, setState] = useState({
    submitted: null,
    inProgress: null
  });
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth={'xs'}
      onClose={onClosed}
      onEscapeKeyDown={onClose}
      onExited={() => setState({ inProgress: null, submitted: null })}
    >
      <CreateNewFolderUI
        {...props}
        submitted={state.submitted}
        inProgress={state.inProgress}
        setState={setState}
      />
    </Dialog>
  );
}

interface CreateNewFolderUIProps extends CreateNewFolderProps {
  submitted: boolean;
  inProgress: boolean;
  setState(values: object): void;
}

function CreateNewFolderUI(props: CreateNewFolderUIProps) {
  const { onClose, path, submitted, inProgress, setState, onCreated, rename = false, value = '' } = props;
  const [name, setName] = useState(value);
  const dispatch = useDispatch();
  const site = useActiveSiteId();

  const onOk = () => {
    setState({ inProgress: true, submitted: true });

    if (name) {
      if (rename) {
        renameFolder(site, path, name).subscribe(
          (resp) => {
            onClose();
            onCreated?.(path, name, rename);
          },
          (response) => {
            setState({ inProgress: false, submitted: true });
            dispatch(showErrorDialog(response));
          }
        );
      } else {
        createNewFolder(site, path, name).subscribe(
          (resp) => {
            onClose();
            onCreated?.(path, name, rename);
          },
          (response) => {
            setState({ inProgress: false, submitted: true });
            dispatch(showErrorDialog(response));
          }
        );
      }

    }
  };
  return (
    <>
      <DialogHeader
        title={
          rename
            ? <FormattedMessage id="newFolder.title.rename" defaultMessage="Rename Folder" />
            : <FormattedMessage id="newFolder.title" defaultMessage="Create a New Folder" />

        }
        onDismiss={inProgress === null ? onClose : null}
      />
      <DialogBody>
        <TextField
          label={
            rename
              ?
              <FormattedMessage id="newFolder.rename" defaultMessage="Provide a new folder name" />
              : <FormattedMessage id="newFolder.folderName" defaultMessage="Folder Name" />
          }
          value={name}
          autoFocus
          required
          error={!name && submitted}
          placeholder="Type a folder name"
          helperText={
            (!name && submitted) ? (
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
          onChange={(event) => setName(event.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
        />
      </DialogBody>
      <DialogFooter>
        <DialogActions>
          <Button onClick={onClose} variant="outlined" disabled={inProgress}>
            <FormattedMessage id="words.close" defaultMessage="Close" />
          </Button>
          <Button
            onClick={() => onOk()} variant="contained" color="primary" autoFocus
            disabled={inProgress}
          >
            {
              inProgress &&
              <CircularProgress size={15} style={{ marginRight: '5px' }} />
            }
            {
              rename
                ? <FormattedMessage id="words.rename" defaultMessage="Rename" />
                : <FormattedMessage id="words.create" defaultMessage="Create" />
            }

          </Button>
        </DialogActions>
      </DialogFooter>
    </>
  );
}
