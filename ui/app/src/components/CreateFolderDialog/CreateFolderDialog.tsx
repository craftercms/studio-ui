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
import EnhancedDialog from '../EnhancedDialog';
import { CreateFolderProps } from './utils';
import CreateFolderContainer from './CreateFolderContainer';
import { FormattedMessage } from 'react-intl';

export function CreateFolderDialog(props: CreateFolderProps) {
  const { path, isSubmitting, allowBraces, value, rename, onRenamed, onCreated, ...rest } = props;
  return (
    <EnhancedDialog
      title={
        rename ? (
          <FormattedMessage id="newFolder.title.rename" defaultMessage="Rename Folder" />
        ) : (
          <FormattedMessage id="newFolder.title" defaultMessage="Create a New Folder" />
        )
      }
      maxWidth="xs"
      isSubmitting={isSubmitting}
      {...rest}
    >
      <CreateFolderContainer
        path={path}
        rename={rename}
        allowBraces={allowBraces}
        value={value}
        isSubmitting={isSubmitting}
        onCreated={onCreated}
        onRenamed={onRenamed}
      />
    </EnhancedDialog>
  );
}

export default CreateFolderDialog;
