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
import { SingleFileUploadDialogProps } from './utils';
import EnhancedDialog from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import SingleFileUploadDialogContainer from './SingleFileUploadDialogContainer';

export default function SingleFileUploadDialog(props: SingleFileUploadDialogProps) {
  const { site, path, customFileName, fileTypes, onUploadStart, onUploadComplete, onUploadError, ...rest } = props;

  return (
    <EnhancedDialog title={<FormattedMessage id="words.upload" defaultMessage="Upload" />} maxWidth="xs" {...rest}>
      <SingleFileUploadDialogContainer
        site={site}
        path={path}
        customFileName={customFileName}
        fileTypes={fileTypes}
        onUploadStart={onUploadStart}
        onUploadComplete={onUploadComplete}
        onUploadError={onUploadError}
      />
    </EnhancedDialog>
  );
}
