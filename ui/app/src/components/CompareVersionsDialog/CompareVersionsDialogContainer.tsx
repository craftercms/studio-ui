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
import { FormattedMessage } from 'react-intl';
import React, { Suspense, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ItemHistoryEntry } from '../../models/Version';
import { CompareVersions } from './CompareVersions';
import {
  compareBothVersions,
  compareVersion,
  versionsChangeItem,
  versionsChangePage
} from '../../state/actions/versions';
import VersionList from '../VersionList';
import DialogBody from '../DialogBody/DialogBody';
import SingleItemSelector from '../SingleItemSelector';
import EmptyState from '../EmptyState/EmptyState';
import Typography from '@mui/material/Typography';
import DialogFooter from '../DialogFooter/DialogFooter';
import { HistoryDialogPagination } from '../HistoryDialog';
import { makeStyles } from 'tss-react/mui';
import { ErrorBoundary } from '../ErrorBoundary';
import { LoadingState } from '../LoadingState';
import ApiResponseErrorState from '../ApiResponseErrorState';

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
  const { selectedA, selectedB, versionsBranch, disableItemSwitching = false } = props;
  const { count, page, limit, selected, compareVersionsBranch, current, item, rootPath } = versionsBranch;
  const { classes, cx } = useStyles();
  const [openSelector, setOpenSelector] = useState(false);
  const dispatch = useDispatch();
  const compareMode = selectedA && selectedB;

  const handleItemClick = (version: ItemHistoryEntry) => {
    if (!selected[0]) {
      dispatch(compareVersion({ id: version.versionNumber }));
    } else if (selected[0] !== version.versionNumber) {
      const selectedADate = new Date(versionsBranch.byId[selected[0]].modifiedDate);
      const selectedBDate = new Date(version.modifiedDate);

      // When comparing versions, we want to show what the new version did to the old. For that, we check for the most
      // recent version and add it first in the list of versions to compare.
      dispatch(
        compareBothVersions({
          versions:
            selectedADate > selectedBDate ? [selected[0], version.versionNumber] : [version.versionNumber, selected[0]]
        })
      );
    } else {
      dispatch(compareVersion());
    }
  };

  const onPageChanged = (nextPage: number) => {
    dispatch(versionsChangePage({ page: nextPage }));
  };

  return (
    <>
      <DialogBody className={cx(classes.dialogBody, compareMode && classes.noPadding)}>
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
          compareVersionsBranch ? (
            compareVersionsBranch.error ? (
              <ApiResponseErrorState error={compareVersionsBranch.error} />
            ) : compareVersionsBranch.isFetching ? (
              <LoadingState />
            ) : compareVersionsBranch.compareVersions?.length > 0 ? (
              <Suspense fallback="">
                <CompareVersions versions={compareVersionsBranch.compareVersions} />
              </Suspense>
            ) : (
              <EmptyState title={<FormattedMessage defaultMessage="No versions found" />} />
            )
          ) : null
        ) : item ? (
          <ErrorBoundary>
            {versionsBranch.isFetching ? (
              <LoadingState />
            ) : (
              versionsBranch.versions && (
                <VersionList
                  selected={selected}
                  versions={versionsBranch.versions}
                  current={current}
                  onItemClick={handleItemClick}
                />
              )
            )}
          </ErrorBoundary>
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
          <HistoryDialogPagination count={count} page={page} rowsPerPage={limit} onPageChanged={onPageChanged} />
        </DialogFooter>
      )}
    </>
  );
}

export default CompareVersionsDialogContainer;
