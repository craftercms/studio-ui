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

import { CompareVersionsDialogContainerProps } from './utils';
import React, { useMemo } from 'react';
import { useLogicResource } from '../../hooks/useLogicResource';
import { CompareVersionsBranch } from '../../models/Version';
import { CompareVersions, CompareVersionsResource } from './CompareVersions';
import { EntityState } from '../../models/EntityState';
import ContentType from '../../models/ContentType';
import DialogBody from '../DialogBody/DialogBody';
import { SuspenseWithEmptyState } from '../Suspencified/Suspencified';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  dialogBody: {
    overflow: 'auto',
    minHeight: '50vh'
  },
  noPadding: {
    padding: 0
  },
  singleItemSelector: {
    marginBottom: '10px'
  },
  typography: {
    lineHeight: '1.5'
  }
}));

export function CompareVersionsDialogContainer(props: CompareVersionsDialogContainerProps) {
  const { versionsBranch, contentTypesBranch } = props;
  const { compareVersionsBranch } = versionsBranch;
  const { classes, cx } = useStyles();

  const compareVersionsData = useMemo(
    () => ({
      compareVersionsBranch,
      contentTypesBranch
    }),
    [compareVersionsBranch, contentTypesBranch]
  );

  const compareVersionsResource = useLogicResource<
    CompareVersionsResource,
    { compareVersionsBranch: CompareVersionsBranch; contentTypesBranch: EntityState<ContentType> }
  >(compareVersionsData, {
    shouldResolve: ({ compareVersionsBranch, contentTypesBranch }) =>
      compareVersionsBranch.compareVersions &&
      contentTypesBranch.byId &&
      !compareVersionsBranch.isFetching &&
      !contentTypesBranch.isFetching,
    shouldReject: ({ compareVersionsBranch, contentTypesBranch }) =>
      Boolean(compareVersionsBranch.error || contentTypesBranch.error),
    shouldRenew: ({ compareVersionsBranch, contentTypesBranch }, resource) => resource.complete,
    resultSelector: ({ compareVersionsBranch, contentTypesBranch }) => ({
      a: compareVersionsBranch.compareVersions?.[0],
      b: compareVersionsBranch.compareVersions?.[1],
      contentTypes: contentTypesBranch.byId
    }),
    errorSelector: ({ compareVersionsBranch, contentTypesBranch }) =>
      compareVersionsBranch.error || contentTypesBranch.error
  });

  return (
    <>
      <DialogBody className={cx(classes.dialogBody, classes.noPadding)}>
        <SuspenseWithEmptyState resource={compareVersionsResource}>
          <CompareVersions resource={compareVersionsResource} />
        </SuspenseWithEmptyState>
      </DialogBody>
    </>
  );
}

export default CompareVersionsDialogContainer;
