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

import { VersionResource, ViewVersionDialogContainerProps } from './utils';
import { useLogicResource } from '../../hooks/useLogicResource';
import DialogBody from '../DialogBody/DialogBody';
import { SuspenseWithEmptyState } from '../Suspencified/Suspencified';
import React from 'react';
import LegacyVersionDialog from './LegacyVersionDialog';

export function ViewVersionDialogContainer(props: ViewVersionDialogContainerProps) {
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

  return (
    <DialogBody sx={{ p: 0 }}>
      <SuspenseWithEmptyState resource={resource}>
        <LegacyVersionDialog resource={resource} />
      </SuspenseWithEmptyState>
    </DialogBody>
  );
}

export default ViewVersionDialogContainer;
