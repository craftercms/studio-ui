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

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { FormattedMessage, useIntl } from 'react-intl';
import { createFile } from '../../services/content';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { validateActionPolicy } from '../../services/sites';
import DialogBody from '../DialogBody/DialogBody';
import TextField from '@mui/material/TextField';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import ConfirmDialog from '../ConfirmDialog';
import { CreateFileContainerProps, getExtension, getName } from './utils';
import { translations } from './translations';
import { updateCreateFileDialog, updateCreateFolderDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import useEnhancedDialogContext from '../EnhancedDialog/useEnhancedDialogContext';
import useItemsByPath from '../../hooks/useItemsByPath';
import { UNDEFINED } from '../../utils/constants';
import { isBlank } from '../../utils/string';

export function CreateFileDialogContainer(props: CreateFileContainerProps) {
  const { onClose, onCreated, type, path, allowBraces } = props;
  const { isSubmitting, hasPendingChanges } = useEnhancedDialogContext();
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState(null);
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const itemLookup = useItemsByPath();
  const computedFilePath = `${path}/${getName(type, name)}`;
  const fileExists = itemLookup[computedFilePath] !== UNDEFINED;
  const isValid = !isBlank(name) && !fileExists;

  const onCreateFile = (site: string, path: string, fileName: string) => {
    createFile(site, path, fileName).subscribe({
      next() {
        onCreated?.({ path, fileName, mode: getExtension(type), openOnSuccess: true });
        dispatch(
          updateCreateFileDialog({
            hasPendingChanges: false,
            isSubmitting: false
          })
        );
      },
      error(response) {
        dispatch(
          batchActions([
            showErrorDialog({ error: response }),
            updateCreateFileDialog({
              isSubmitting: false
            })
          ])
        );
      }
    });
  };

  const onCreate = () => {
    dispatch(
      updateCreateFileDialog({
        isSubmitting: true
      })
    );
    if (name) {
      validateActionPolicy(site, {
        type: 'CREATE',
        target: `${path}/${name}`
      }).subscribe(({ allowed, modifiedValue }) => {
        if (allowed) {
          if (modifiedValue) {
            setConfirm({
              body: formatMessage(translations.createPolicy, { name: modifiedValue.replace(`${path}/`, '') })
            });
          } else {
            const fileName = getName(type, name);
            onCreateFile(site, path, fileName);
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
    const fileName = getName(type, name);
    onCreateFile(site, path, fileName);
  };

  const onConfirmCancel = () => {
    setConfirm(null);
    dispatch(
      updateCreateFileDialog({
        isSubmitting: false
      })
    );
  };

  const onInputChanges = (value: string) => {
    setName(value);
    const newHasPending = !isBlank(value);
    hasPendingChanges !== newHasPending &&
      dispatch(
        updateCreateFileDialog({
          hasPendingChanges: newHasPending
        })
      );
  };

  return (
    <>
      <DialogBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate();
          }}
        >
          <TextField
            label={<FormattedMessage id="createFileDialog.fileName" defaultMessage="File Name" />}
            value={name}
            fullWidth
            autoFocus
            required
            error={(!name && isSubmitting !== null) || fileExists}
            placeholder={formatMessage(translations.placeholder)}
            helperText={
              fileExists ? (
                <FormattedMessage
                  id="createFileDialog.fileAlreadyExists"
                  defaultMessage="A file with that name already exists"
                />
              ) : !name && isSubmitting ? (
                <FormattedMessage id="createFileDialog.fileNameRequired" defaultMessage="File name is required." />
              ) : (
                <FormattedMessage
                  id="createFileDialog.helperText"
                  defaultMessage="Consisting of letters, numbers, dot (.), dash (-) and underscore (_)."
                />
              )
            }
            disabled={isSubmitting}
            margin="normal"
            InputLabelProps={{
              shrink: true
            }}
            onChange={(event) =>
              onInputChanges(
                event.target.value
                  .replace(allowBraces ? /[^a-zA-Z0-9-_{}.]/g : /[^a-zA-Z0-9-_.]/g, '')
                  .replace(/\.{1,}/g, '.')
              )
            }
          />
        </form>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={(e) => onClose(e, null)} disabled={isSubmitting}>
          <FormattedMessage id="words.close" defaultMessage="Close" />
        </SecondaryButton>
        <PrimaryButton onClick={onCreate} disabled={isSubmitting || !isValid} loading={isSubmitting}>
          <FormattedMessage id="words.create" defaultMessage="Create" />
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

export default CreateFileDialogContainer;
