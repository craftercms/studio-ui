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

import { VersionResource, ViewVersionDialogContainerProps } from './utils';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import DialogHeader from '../Dialogs/DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../Dialogs/DialogBody';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import React from 'react';
import LegacyVersionDialog from './LegacyVersionDialog';

export default function ViewVersionDialogContainer(props: ViewVersionDialogContainerProps) {
  const { rightActions, onClose, onClosed } = props;
  useUnmount(onClosed);
  const resource = useLogicResource<VersionResource, ViewVersionDialogContainerProps>(props, {
    shouldResolve: (source) =>
      source.version && source.contentTypesBranch.byId && !source.isFetching && !source.contentTypesBranch.isFetching,
    shouldReject: (source) => Boolean(source.error) || Boolean(source.contentTypesBranch.error),
    shouldRenew: (source, resource) => (source.isFetching || source.contentTypesBranch.isFetching) && resource.complete,
    resultSelector: (source) => ({
      version: source.version,
      contentTypes: source.contentTypesBranch.byId
    }),
    errorSelector: (source) => source.error || source.contentTypesBranch.error
  });

  const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="viewVersionDialog.headerTitle" defaultMessage="Viewing item version" />}
        rightActions={rightActions}
        onCloseButtonClick={onCloseButtonClick}
      />
      <DialogBody>
        <SuspenseWithEmptyState resource={resource}>
          <LegacyVersionDialog resource={resource} />
        </SuspenseWithEmptyState>
      </DialogBody>
    </>
  );
}
