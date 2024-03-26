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
import { CreateFileDialogContainer } from './CreateFileDialogContainer';
import { CreateFileProps } from './utils';
import EnhancedDialog from '../EnhancedDialog/EnhancedDialog';
import { FormattedMessage } from 'react-intl';

export function CreateFileDialog(props: CreateFileProps) {
  const { type, path, allowBraces, allowSubFolders, onCreated, ...rest } = props;
  return (
    <EnhancedDialog
      title={
        type === 'controller' ? (
          <FormattedMessage id="createFileDialog.controller" defaultMessage="New Controller" />
        ) : (
          <FormattedMessage id="createFileDialog.template" defaultMessage="New Template" />
        )
      }
      maxWidth="xs"
      {...rest}
    >
      <CreateFileDialogContainer
        path={path}
        onCreated={onCreated}
        type={type}
        allowBraces={allowBraces}
        allowSubFolders={allowSubFolders}
      />
    </EnhancedDialog>
  );
}

export default CreateFileDialog;
