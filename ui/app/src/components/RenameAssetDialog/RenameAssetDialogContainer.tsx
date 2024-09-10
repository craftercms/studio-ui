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
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { fetchRenameAssetDependants, updateRenameAssetDialog } from '../../state/actions/dialogs';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useItemsByPath from '../../hooks/useItemsByPath';
import { getFileNameWithExtensionForItemType, getParentPath } from '../../utils/path';
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
import { RenameItemView } from '../RenameDialogBody';
import { applyAssetNameRules } from '../../utils/content';
import { DialogBody } from '../DialogBody';
import { getHostToHostBus } from '../../utils/subjects';
import { filter } from 'rxjs/operators';
import { contentEvent } from '../../state/actions/system';

export function RenameAssetDialogContainer(props: RenameAssetContainerProps) {
  const {
    onClose,
    onRenamed,
    path,
    value = '',
    allowBraces = false,
    type,
    dependantItems,
    fetchingDependantItems,
    error
  } = props;
  const { isSubmitting, hasPendingChanges } = useEnhancedDialogContext();
  const [name, setName] = useState(value);
  const dispatch = useDispatch();
  const itemLookupTable = useItemsByPath();
  const newAssetName = type !== 'asset' ? getFileNameWithExtensionForItemType(type, name) : name;
  const newAssetPath = `${getParentPath(path)}/${newAssetName}`;
  const assetExists = newAssetName !== value && itemLookupTable[newAssetPath] !== UNDEFINED;
  const isValid = !isBlank(name) && !assetExists && name !== value;
  const siteId = useActiveSiteId();
  const [confirm, setConfirm] = useState(null);
  const [confirmBrokenReferences, setConfirmBrokenReferences] = useState(false);
  const { formatMessage } = useIntl();
  const renameDisabled =
    isSubmitting || !isValid || fetchingDependantItems || (dependantItems?.length > 0 && !confirmBrokenReferences);

  useEffect(() => {
    dispatch(fetchRenameAssetDependants());
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => e.type === contentEvent.type)).subscribe(() => {
      dispatch(fetchRenameAssetDependants());
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const onInputChanges = (newValue: string) => {
    setName(newValue);
    const newHasPendingChanges = newValue !== value;
    hasPendingChanges !== newHasPendingChanges &&
      dispatch(updateRenameAssetDialog({ hasPendingChanges: newHasPendingChanges }));
  };

  const onRenameAsset = (siteId: string, path: string, name: string) => {
    const fileName = type !== 'asset' ? getFileNameWithExtensionForItemType(type, name) : name;
    renameContent(siteId, path, fileName).subscribe({
      next() {
        onRenamed?.({ path, name });
        dispatch(updateRenameAssetDialog({ isSubmitting: false, hasPendingChanges: false }));
      },
      error({ response }) {
        dispatch(showErrorDialog({ error: response.response }));
        dispatch(updateRenameAssetDialog({ isSubmitting: false }));
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
      }).subscribe(({ allowed, modifiedValue, message }) => {
        if (allowed && modifiedValue) {
          setConfirm({ body: message });
        } else if (allowed) {
          onRenameAsset(siteId, path, name);
        } else {
          setConfirm({
            error: true,
            body: formatMessage(translations.policyError, { fileName: name, detail: message })
          });
        }
      });
    }
  };

  return (
    <>
      <DialogBody>
        <RenameItemView
          name={name}
          disabled={renameDisabled}
          newNameExists={assetExists}
          dependantItems={dependantItems}
          isSubmitting={isSubmitting}
          confirmBrokenReferences={confirmBrokenReferences}
          fetchingDependantItems={fetchingDependantItems}
          error={error}
          setConfirmBrokenReferences={setConfirmBrokenReferences}
          onRename={onRename}
          onInputChanges={(event) => onInputChanges(applyAssetNameRules(event.target.value, { allowBraces }))}
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
        />
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
