/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import StandardAction from '../../../models/StandardAction';
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import { FormattedMessage } from 'react-intl';
import { useStateResource } from '../../../utils/hooks';
import { VersionList } from './VersionList';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import ApiResponse from '../../../models/ApiResponse';
import DialogHeader, {
  DialogHeaderAction,
  DialogHeaderStateAction
} from '../../../components/Dialogs/DialogHeader';
import { EntityState } from '../../../models/EntityState';
import { LegacyVersion } from '../../../models/Version';
import DialogBody from '../../../components/Dialogs/DialogBody';

interface compare {
  a: string;
  b: string;
}

interface CompareVersionsDialogBaseProps {
  open: boolean;
  error: ApiResponse;
  isFetching: boolean;
  compare: compare;
  page: number;
  rowsPerPage: number;
}

interface CompareVersionsDialogProps extends CompareVersionsDialogBaseProps {
  versionsBranch: Partial<EntityState<LegacyVersion>>;
  leftActions?: DialogHeaderAction[];
  rightActions?: DialogHeaderAction[];
  onClose(): void;
  onDismiss(): void;
}

export interface CompareVersionsDialogStateProps extends CompareVersionsDialogBaseProps {
  leftActions?: DialogHeaderStateAction[];
  rightActions?: DialogHeaderStateAction[];
  onClose?: StandardAction;
  onDismiss?: StandardAction;
}

export default function CompareVersionsDialog(props: CompareVersionsDialogProps) {
  const { open, compare, leftActions, rightActions, onDismiss, onClose, versionsBranch } = props;

  const versionsResource = useStateResource<LegacyVersion[], CompareVersionsDialogProps>(props, {
    shouldResolve: ({ versionsBranch }) => Boolean(versionsBranch.versions) && !versionsBranch.isFetching,
    shouldReject: ({ versionsBranch }) => Boolean(versionsBranch.error),
    shouldRenew: ({ versionsBranch }, resource) => (
      versionsBranch.isFetching && versionsBranch.complete
    ),
    resultSelector: ({ versionsBranch, page, rowsPerPage }) => (
      versionsBranch.versions.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    ),
    errorSelector: ({ versionsBranch }) => versionsBranch.error
  });

  const handleItemClick = (version: LegacyVersion) => {
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth="md"
      onEscapeKeyDown={onDismiss}
    >
      <DialogHeader
        title={
          <FormattedMessage
            id="compareVersionsDialog.headerTitle"
            defaultMessage="Comparing {name}"
            values={{ name: 'Home' }}
          />
        }
        rightActions={rightActions}
        onDismiss={onDismiss}
      />
      <DialogBody>
        <SuspenseWithEmptyState resource={versionsResource}>
          <VersionList
            resource={versionsResource}
            handleItemClick={handleItemClick}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
    </Dialog>
  );
}
