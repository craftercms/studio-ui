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
import { createFile, fetchSandboxItem } from '../../services/content';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { validateActionPolicy } from '../../services/sites';
import DialogBody from '../DialogBody/DialogBody';
import TextField from '@mui/material/TextField';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import ConfirmDialog from '../ConfirmDialog';
import { CreateFileContainerProps } from './utils';
import { translations } from './translations';
import { updateCreateFileDialog, updateCreateFolderDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import useEnhancedDialogContext from '../EnhancedDialog/useEnhancedDialogContext';
import useItemsByPath from '../../hooks/useItemsByPath';
import { UNDEFINED } from '../../utils/constants';
import { isBlank } from '../../utils/string';
import { applyAssetNameRules } from '../../utils/content';
import { getFileNameWithExtensionForItemType, pickExtensionForItemType } from '../../utils/path';
import ApiResponse from '../../models/ApiResponse';

export function CreateFileDialogContainer(props: CreateFileContainerProps) {
  const { onClose, onCreated, type, path, allowBraces } = props;
  const { isSubmitting, hasPendingChanges } = useEnhancedDialogContext();
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState(null);
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const itemLookup = useItemsByPath();
  const computedFilePath = `${path}/${getFileNameWithExtensionForItemType(type, name)}`;
  // When calling the validation API, we need to check if the item with the suggested name exists. This is an extra validation for the
  // fileExists const.
  const [itemExists, setItemExists] = useState(false);
  const fileExists = itemExists || itemLookup[computedFilePath] !== UNDEFINED;
  const isValid = !isBlank(name) && !fileExists;

  const onError = (error: ApiResponse) => {
    dispatch(
      batchActions([
        showErrorDialog({ error }),
        updateCreateFileDialog({
          isSubmitting: false
        })
      ])
    );
  };

  const onCreateFile = (site: string, path: string, fileName: string) => {
    createFile(site, path, fileName).subscribe({
      next() {
        onCreated?.({ path, fileName, mode: pickExtensionForItemType(type), openOnSuccess: true });
        dispatch(
          updateCreateFileDialog({
            hasPendingChanges: false,
            isSubmitting: false
          })
        );
      },
      error: onError
    });
  };

  const onSubmit = () => {
    dispatch(
      updateCreateFileDialog({
        isSubmitting: true
      })
    );
    if (name) {
      validateActionPolicy(site, {
        type: 'CREATE',
        target: `${path}/${name}`
      }).subscribe({
        next: ({ allowed, modifiedValue, message }) => {
          if (allowed) {
            const fileName = getFileNameWithExtensionForItemType(type, name);
            const pathToCheckExists = modifiedValue ?? `${path}/${fileName}`;
            setItemExists(false);
            fetchSandboxItem(site, pathToCheckExists).subscribe({
              next: (item) => {
                if (item) {
                  setItemExists(true);
                  dispatch(updateCreateFileDialog({ isSubmitting: false }));
                } else {
                  if (modifiedValue) {
                    setConfirm({
                      body: formatMessage(translations.createPolicy, {
                        name: modifiedValue.replace(`${path}/`, ''),
                        detail: message
                      })
                    });
                  } else {
                    onCreateFile(site, path, fileName);
                  }
                }
              },
              error: onError
            });
          } else {
            setConfirm({
              error: true,
              body: formatMessage(translations.policyError, { detail: message })
            });
            dispatch(
              updateCreateFolderDialog({
                isSubmitting: false
              })
            );
          }
        },
        error: onError
      });
    }
  };

  const onConfirm = () => {
    const fileName = getFileNameWithExtensionForItemType(type, name);
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
    setItemExists(false);
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
            if (isValid) {
              onSubmit();
            }
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
            onChange={(event) => onInputChanges(applyAssetNameRules(event.target.value, { allowBraces }))}
          />
        </form>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={(e) => onClose(e, null)} disabled={isSubmitting}>
          <FormattedMessage id="words.close" defaultMessage="Close" />
        </SecondaryButton>
        <PrimaryButton onClick={onSubmit} disabled={isSubmitting || !isValid} loading={isSubmitting}>
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
