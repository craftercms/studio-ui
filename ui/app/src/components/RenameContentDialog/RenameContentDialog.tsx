/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { EnhancedDialog, EnhancedDialogProps } from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import React, { useEffect, useState } from 'react';
import { DetailedItem } from '../../models';
import RenameContentDialogContainer from './RenameContentDialogContainer';
import { fetchDependant } from '../../services/dependencies';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { parseLegacyItemToDetailedItem } from '../../utils/content';
import useWithPendingChangesCloseRequest from '../../hooks/useWithPendingChangesCloseRequest';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import { ensureSingleSlash, isBlank } from '../../utils/string';

export interface RenameContentDialogProps extends EnhancedDialogProps {
  path: string;
  value?: string;
  onRenamed(name: string): void;
  onSubmittingAndOrPendingChange(value: onSubmittingAndOrPendingChangeProps): void;
}

export function RenameContentDialog(props: RenameContentDialogProps) {
  const { path, value, onRenamed, onSubmittingAndOrPendingChange, ...dialogProps } = props;
  const [dependantItems, setDependantItems] = useState<DetailedItem[]>(null);
  const [fetchingDependantItems, setFetchingDependantItems] = useState(false);
  const [error, setError] = useState(null);
  const siteId = useActiveSiteId();
  const pendingChangesCloseRequest = useWithPendingChangesCloseRequest(dialogProps.onClose);

  useEffect(() => {
    if (!isBlank(value) && !isBlank(path)) {
      setFetchingDependantItems(true);
      fetchDependant(siteId, ensureSingleSlash(`${path}/${value}`)).subscribe({
        next: (response) => {
          const dependants = parseLegacyItemToDetailedItem(response);
          setDependantItems(dependants);
          setFetchingDependantItems(false);
        },
        error: ({ response }) => {
          setError(response);
          setFetchingDependantItems(false);
        }
      });
    }
  }, [path, value, siteId]);

  return (
    <EnhancedDialog
      title={<FormattedMessage id="renameAsset.title" defaultMessage="Rename Content" />}
      onWithPendingChangesCloseRequest={pendingChangesCloseRequest}
      maxWidth={dependantItems?.length > 0 ? 'md' : 'xs'}
      {...dialogProps}
    >
      <RenameContentDialogContainer
        path={path}
        value={value}
        dependantItems={dependantItems}
        fetchingDependantItems={fetchingDependantItems}
        onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange}
        onRenamed={onRenamed}
        error={error}
      />
    </EnhancedDialog>
  );
}

export default RenameContentDialog;
