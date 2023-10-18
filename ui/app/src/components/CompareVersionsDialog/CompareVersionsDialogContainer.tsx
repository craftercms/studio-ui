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
import React, { useEffect, useState } from 'react';
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
import useSpreadState from '../../hooks/useSpreadState';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { forkJoin } from 'rxjs';
import { fetchContentByCommitId } from '../../services/content';
import { fromString } from '../../utils/xml';
import { parseContentXML } from '../../utils/content';
import { ApiResponseErrorState } from '../ApiResponseErrorState';

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
  const { selectedA, selectedB, versionsBranch, disableItemSwitching = false, contentTypesBranch } = props;
  const { count, page, limit, selected, compareVersionsBranch, current, item, rootPath } = versionsBranch;
  const { classes, cx } = useStyles();
  const [openSelector, setOpenSelector] = useState(false);
  const dispatch = useDispatch();
  const compareMode = selectedA && selectedB;
  const [selectionContent, setSelectionContent] = useSpreadState({ contentA: null, contentB: null });
  const siteId = useActiveSiteId();
  const isCompareDataReady =
    compareVersionsBranch?.compareVersions &&
    contentTypesBranch?.byId &&
    item?.contentTypeId &&
    selectionContent.contentA &&
    selectionContent.contentB;

  useEffect(() => {
    forkJoin([
      fetchContentByCommitId(siteId, selectedA.path, selectedA.versionNumber),
      fetchContentByCommitId(siteId, selectedB.path, selectedB.versionNumber)
    ]).subscribe(([contentA, contentB]) => {
      setSelectionContent({
        contentA: parseContentXML(fromString(contentA as string), selectedA.path, contentTypesBranch.byId, {}),
        contentB: parseContentXML(fromString(contentB as string), selectedB.path, contentTypesBranch.byId, {})
      });
    });
  }, [selectedA, selectedB, siteId, setSelectionContent, contentTypesBranch.byId]);

  const handleItemClick = (version: ItemHistoryEntry) => {
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
          <>
            {!isCompareDataReady ? (
              <LoadingState />
            ) : compareVersionsBranch.error || contentTypesBranch.error ? (
              <ApiResponseErrorState error={compareVersionsBranch.error ?? contentTypesBranch.error} />
            ) : (
              <CompareVersions
                a={{
                  ...selectedA,
                  ...compareVersionsBranch.compareVersions?.[0],
                  content: selectionContent.contentA
                }}
                b={{
                  ...selectedB,
                  ...compareVersionsBranch.compareVersions?.[1],
                  content: selectionContent.contentB
                }}
                contentTypeId={item.contentTypeId}
                contentTypes={contentTypesBranch.byId}
              />
            )}
          </>
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
