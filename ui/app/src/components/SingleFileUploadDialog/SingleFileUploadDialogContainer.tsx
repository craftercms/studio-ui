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

import React from 'react';
import { SingleFileUploadDialogContainerProps } from './utils';
import { useDispatch } from 'react-redux';
import DialogBody from '../Dialogs/DialogBody';
import SingleFileUploadDialogUI from './SingleFileUploadDialogUI';
import { updateSingleFileUploadDialog } from '../../state/actions/dialogs';
import { showSystemNotification } from '../../state/actions/system';

export default function SingleFileUploadDialogContainer(props: SingleFileUploadDialogContainerProps) {
  const { onUploadComplete, onUploadStart, onUploadError, ...rest } = props;
  const dispatch = useDispatch();

  const onStart = () => {
    onUploadStart?.();
    dispatch(
      updateSingleFileUploadDialog({
        isSubmitting: true
      })
    );
  };

  const onComplete = (result) => {
    dispatch(
      updateSingleFileUploadDialog({
        isSubmitting: false
      })
    );
    onUploadComplete?.(result);
  };

  const onError = ({ file, error, response }) => {
    dispatch(
      showSystemNotification({
        message: error.message
      })
    );

    onUploadError?.({ file, error, response });
  };

  return (
    <DialogBody>
      <SingleFileUploadDialogUI
        onUploadComplete={onComplete}
        onUploadStart={onStart}
        onUploadError={onError}
        {...rest}
      />
    </DialogBody>
  );
}
