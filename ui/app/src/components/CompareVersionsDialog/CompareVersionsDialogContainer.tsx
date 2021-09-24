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

import { CompareVersionsDialogContainerProps } from './utils';
import { FormattedMessage } from 'react-intl';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { CompareVersionsBranch, LegacyVersion, VersionsStateProps } from '../../models/Version';
import { CompareVersions, CompareVersionsResource } from './CompareVersions';
import { EntityState } from '../../models/EntityState';
import ContentType from '../../models/ContentType';
import {
  compareBothVersions,
  compareVersion,
  versionsChangeItem,
  versionsChangePage
} from '../../state/reducers/versions';
import VersionList from '../VersionList';
import DialogBody from '../Dialogs/DialogBody';
import clsx from 'clsx';
import SingleItemSelector from '../SingleItemSelector';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import EmptyState from '../SystemStatus/EmptyState';
import Typography from '@mui/material/Typography';
import DialogFooter from '../Dialogs/DialogFooter';
import { Pagination } from '../HistoryDialog';
import { useStyles } from './CompareVersionsDialog';

export default function CompareVersionsDialogContainer(props: CompareVersionsDialogContainerProps) {
  const { selectedA, selectedB, versionsBranch, disableItemSwitching = false, contentTypesBranch } = props;
  const { count, page, limit, selected, compareVersionsBranch, current, item, rootPath } = versionsBranch;
  const classes = useStyles({});
  const [openSelector, setOpenSelector] = useState(false);
  const dispatch = useDispatch();
  const compareMode = selectedA && selectedB;

  const versionsResource = useLogicResource<LegacyVersion[], VersionsStateProps>(versionsBranch, {
    shouldResolve: (_versionsBranch) => Boolean(_versionsBranch.versions) && !_versionsBranch.isFetching,
    shouldReject: (_versionsBranch) => Boolean(_versionsBranch.error),
    shouldRenew: (_versionsBranch, resource) => resource.complete,
    resultSelector: (_versionsBranch) => _versionsBranch.versions,
    errorSelector: (_versionsBranch) => _versionsBranch.error
  });

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

  const handleItemClick = (version: LegacyVersion) => {
    if (!selected[0]) {
      dispatch(compareVersion({ id: version.versionNumber }));
    } else if (selected[0] !== version.versionNumber) {
      dispatch(compareBothVersions({ versions: [selected[0], version.versionNumber] }));
    } else {
      dispatch(compareVersion());
    }
  };

  const onPageChanged = (nextPage: number) => {
    dispatch(versionsChangePage({ page: nextPage }));
  };

  return (
    <>
      <DialogBody className={clsx(classes.dialogBody, compareMode && classes.noPadding)}>
        {!compareMode && (
          <SingleItemSelector
            classes={{ root: classes.singleItemSelector }}
            label={<FormattedMessage id="words.item" defaultMessage="Item" />}
            disabled={disableItemSwitching}
            open={openSelector}
            onClose={() => setOpenSelector(false)}
            onDropdownClick={() => setOpenSelector(!openSelector)}
            rootPath={rootPath}
            selectedItem={item}
            onItemClicked={(item) => {
              setOpenSelector(false);
              dispatch(versionsChangeItem({ item }));
            }}
          />
        )}
        {compareMode ? (
          <SuspenseWithEmptyState resource={compareVersionsResource}>
            <CompareVersions resource={compareVersionsResource} />
          </SuspenseWithEmptyState>
        ) : item ? (
          <SuspenseWithEmptyState resource={versionsResource}>
            <VersionList
              selected={selected}
              versions={versionsResource}
              current={current}
              onItemClick={handleItemClick}
            />
          </SuspenseWithEmptyState>
        ) : (
          <EmptyState
            title={
              <FormattedMessage id="compareVersionsDialog.pleaseContentItem" defaultMessage="Please content item" />
            }
          >
            <section>
              <Typography variant="subtitle1" color="textSecondary" className={classes.typography}>
                1. Select item <br />
                2. Select revision “A” <br />
                3. Select revision “B” <br />
                4. View diff
              </Typography>
            </section>
          </EmptyState>
        )}
      </DialogBody>
      {!compareMode && item?.path && (
        <DialogFooter>
          <Pagination count={count} page={page} rowsPerPage={limit} onPageChanged={onPageChanged} />
        </DialogFooter>
      )}
    </>
  );
}
