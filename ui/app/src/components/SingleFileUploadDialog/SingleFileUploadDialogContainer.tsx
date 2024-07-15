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

import React, { useCallback } from 'react';
import { SingleFileUploadDialogContainerProps } from './utils';
import { useDispatch } from 'react-redux';
import DialogBody from '../DialogBody/DialogBody';
import SingleFileUploadDialogUI from './SingleFileUploadDialogUI';
import { updateSingleFileUploadDialog } from '../../state/actions/dialogs';

export function SingleFileUploadDialogContainer(props: SingleFileUploadDialogContainerProps) {
  const { onUploadComplete, onUploadStart, onUploadError, ...rest } = props;
  const dispatch = useDispatch();
  const onStart = useCallback(() => {
    onUploadStart?.();
    dispatch(
      updateSingleFileUploadDialog({
        isSubmitting: true
      })
    );
  }, [dispatch, onUploadStart]);

  const onComplete = useCallback(
    (result) => {
      dispatch(
        updateSingleFileUploadDialog({
          isSubmitting: false
        })
      );
      onUploadComplete?.(result);
    },
    [dispatch, onUploadComplete]
  );

  const onError = useCallback(
    ({ file, error, response }) => {
      dispatch(
        updateSingleFileUploadDialog({
          isSubmitting: false
        })
      );

      onUploadError?.({ file, error, response });
    },
    [dispatch, onUploadError]
  );

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

export default SingleFileUploadDialogContainer;
