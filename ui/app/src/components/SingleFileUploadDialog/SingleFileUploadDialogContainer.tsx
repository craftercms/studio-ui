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
import DialogBody from '../Dialogs/DialogBody';
import SingleFileUpload from '../Controls/SingleFileUpload';
import DialogHeader from '../DialogHeader';
import { FormattedMessage } from 'react-intl';

export default function SingleFileUploadDialogContainer(props: SingleFileUploadDialogContainerProps) {
  const { site, onClose, path, customFileName, fileTypes, onComplete, onUploadStart, onError } = props;
  const url = `/studio/asset-upload`;

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="words.upload" defaultMessage="Upload" />}
        onCloseButtonClick={onClose}
      />
      <DialogBody>
        <form id="asset_upload_form">
          <input type="hidden" name="path" value={path} />
          <input type="hidden" name="site" value={site} />
        </form>
        <SingleFileUpload
          formTarget="#asset_upload_form"
          url={url}
          site={site}
          path={path}
          customFileName={customFileName}
          fileTypes={fileTypes}
          onComplete={onComplete}
          onUploadStart={onUploadStart}
          onError={onError}
        />
      </DialogBody>
    </>
  );
}
