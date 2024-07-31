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
  value?: string; // value to initially display on input, may differ from the actual stored value.
  currentValue?: string; // current stored value, defaults to value. Used to fetch dependants and validate existence.
  onRenamed(name: string): void;
  onSubmittingAndOrPendingChange(value: onSubmittingAndOrPendingChangeProps): void;
}

export function RenameContentDialog(props: RenameContentDialogProps) {
  const { path, value, currentValue = value, onRenamed, onSubmittingAndOrPendingChange, ...dialogProps } = props;
  const [dependantItems, setDependantItems] = useState<DetailedItem[]>(null);
  const [fetchingDependantItems, setFetchingDependantItems] = useState(false);
  const [error, setError] = useState(null);
  const siteId = useActiveSiteId();
  const pendingChangesCloseRequest = useWithPendingChangesCloseRequest(dialogProps.onClose);

  useEffect(() => {
    if (!isBlank(currentValue) && !isBlank(path)) {
      setFetchingDependantItems(true);
      // Fetch dependant items using 'currentValue', as it is the stored value. 'value' does not necessary reflects the
      // current stored value.
      fetchDependant(siteId, ensureSingleSlash(`${path}/${currentValue}`)).subscribe({
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
  }, [path, currentValue, siteId]);

  return (
    <EnhancedDialog
      title={<FormattedMessage defaultMessage="Rename Content" />}
      onWithPendingChangesCloseRequest={pendingChangesCloseRequest}
      maxWidth={dependantItems?.length > 0 ? 'md' : 'xs'}
      {...dialogProps}
    >
      <RenameContentDialogContainer
        path={path}
        value={value}
        currentValue={currentValue}
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
