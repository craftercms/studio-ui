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

import React from 'react';
import { BrowseFilesDialogContainer } from './BrowseFilesDialogContainer';
import { BrowseFilesDialogProps } from './utils';
import { FormattedMessage } from 'react-intl';
import EnhancedDialog from '../EnhancedDialog';

export function BrowseFilesDialog(props: BrowseFilesDialogProps) {
  const {
    path,
    onClose,
    onSuccess,
    contentTypes,
    multiSelect,
    mimeTypes,
    numOfLoaderItems,
    allowUpload,
    initialParameters,
    ...rest
  } = props;
  return (
    <EnhancedDialog
      title={<FormattedMessage id="browseFilesDialog.uploadImage" defaultMessage="Select an item" />}
      onClose={onClose}
      maxWidth="lg"
      {...rest}
    >
      <BrowseFilesDialogContainer
        path={path}
        allowUpload={allowUpload}
        contentTypes={contentTypes}
        mimeTypes={mimeTypes}
        multiSelect={multiSelect}
        onClose={onClose}
        onSuccess={onSuccess}
        numOfLoaderItems={numOfLoaderItems}
        initialParameters={initialParameters}
      />
    </EnhancedDialog>
  );
}

export default BrowseFilesDialog;
