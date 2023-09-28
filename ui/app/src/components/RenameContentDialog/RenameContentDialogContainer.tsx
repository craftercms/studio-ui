/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { RenameContentDialogProps } from './RenameContentDialog';
import React, { useCallback, useEffect, useState } from 'react';
import { isBlank } from '../../utils/string';
import { RenameItemView } from '../RenameDialogBody';
import { DialogFooter } from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../PrimaryButton';
import { useEnhancedDialogContext } from '../EnhancedDialog';
import { DetailedItem } from '../../models';
import { DialogBody } from '../DialogBody';
import { AjaxError } from 'rxjs/ajax';
import useDebouncedInput from '../../hooks/useDebouncedInput';
import { checkPathExistence } from '../../services/content';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useUpdateRefs from '../../hooks/useUpdateRefs';

export interface RenameContentDialogContainerProps
  extends Pick<
    RenameContentDialogProps,
    'path' | 'value' | 'onRenamed' | 'onClose' | 'onSubmittingAndOrPendingChange'
  > {
  dependantItems: DetailedItem[];
  fetchingDependantItems: boolean;
  error: AjaxError;
}

export function RenameContentDialogContainer(props: RenameContentDialogContainerProps) {
  const {
    path,
    value,
    onRenamed,
    onClose,
    dependantItems,
    fetchingDependantItems,
    error,
    onSubmittingAndOrPendingChange
  } = props;
  const isPage = value.includes('/index.xml');
  const { isSubmitting } = useEnhancedDialogContext();
  const strippedValue = isPage ? value.replace('/index.xml', '') : value.replace('.xml', '');
  const [name, setName] = useState(strippedValue);
  const [itemExists, setItemExists] = useState(false);
  const isValid = !isBlank(name) && !itemExists && name !== strippedValue;
  const [confirmBrokenReferences, setConfirmBrokenReferences] = useState(false);
  const renameDisabled =
    isSubmitting || !isValid || fetchingDependantItems || (dependantItems?.length > 0 && !confirmBrokenReferences);
  const siteId = useActiveSiteId();
  const refs = useUpdateRefs({ onNameUpdate$: null });

  refs.current.onNameUpdate$ = useDebouncedInput(
    useCallback(
      (name: string) => {
        checkPathExistence(siteId, `${path}${name}${isPage ? '/index.xml' : '.xml'}`).subscribe((exists) => {
          setItemExists(name !== strippedValue && exists);
        });
      },
      [path, siteId, strippedValue, isPage]
    ),
    400
  );

  useEffect(() => {
    refs.current.onNameUpdate$.next(name);
  }, [name, refs]);

  const onInputChanges = (newValue: string) => {
    setName(newValue);
    const newHasPendingChanges = newValue !== strippedValue;
    onSubmittingAndOrPendingChange({ hasPendingChanges: newHasPendingChanges });
  };

  const onRename = () => {
    onRenamed(`${name}${isPage ? '/index.xml' : '.xml'}`);
  };

  return (
    <>
      <DialogBody>
        <RenameItemView
          name={name}
          disabled={false}
          newNameExists={itemExists}
          dependantItems={dependantItems}
          isSubmitting={false}
          confirmBrokenReferences={confirmBrokenReferences}
          fetchingDependantItems={fetchingDependantItems}
          error={error}
          setConfirmBrokenReferences={setConfirmBrokenReferences}
          onRename={onRename}
          onInputChanges={(event) => onInputChanges(event.target.value)}
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
    </>
  );
}

export default RenameContentDialogContainer;
