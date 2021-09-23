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

import { FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import NewRemoteRepositoryForm from '../NewRemoteRepositoryForm/NewRemoteRepositoryForm';
import DialogFooter from '../Dialogs/DialogFooter';
import React from 'react';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { NewRemoteRepositoryDialogUIProps } from './utils';

export function NewRemoteRepositoryDialogUI(props: NewRemoteRepositoryDialogUIProps) {
  const { inputs, setInputs, isSubmitting, isValid, onCloseButtonClick, onCreate } = props;

  const onSubmit = (e) => {
    e.preventDefault();
    onCreate();
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogBody>
        <NewRemoteRepositoryForm inputs={inputs} setInputs={setInputs} />
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCloseButtonClick} disabled={isSubmitting}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={isSubmitting || !isValid} loading={isSubmitting}>
          <FormattedMessage id="words.create" defaultMessage="Create" />
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}

export default NewRemoteRepositoryDialogUI;
