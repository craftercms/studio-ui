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

import React, { ReactNode } from 'react';
import DialogHeader from '../Dialogs/DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import { useUnmount } from '../../utils/hooks/useUnmount';

interface SingleFileUploadDialogUIProps {
  title: ReactNode;
  onClose(): void;
  onClosed?(): void;
}

export function SingleFileUploadDialogUI(props: SingleFileUploadDialogUIProps) {
  const { title, onClose, onClosed } = props;

  useUnmount(onClosed);

  return (
    <>
      <DialogHeader title={title} onDismiss={onClose} />
      <DialogBody></DialogBody>
      <DialogFooter>
        <SecondaryButton>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
      </DialogFooter>
    </>
  );
}
