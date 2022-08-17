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

import { EnhancedDialog } from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import { RenameAssetProps } from './utils';
import { RenameAssetDialogContainer } from './RenameAssetDialogContainer';

export function RenameAssetDialog(props: RenameAssetProps) {
  const { path, allowBraces, value, onRenamed, type, dependantItems, ...rest } = props;

  return (
    <EnhancedDialog
      title={<FormattedMessage id="renameAsset.title" defaultMessage="Rename Asset" />}
      maxWidth={dependantItems.length > 0 ? 'md' : 'xs'}
      {...rest}
    >
      <RenameAssetDialogContainer
        path={path}
        allowBraces={allowBraces}
        value={value}
        type={type}
        dependantItems={dependantItems}
        onRenamed={onRenamed}
      />
    </EnhancedDialog>
  );
}

export default RenameAssetDialog;
