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
import { ErrorBoundary } from '../ErrorBoundary';
import { LoadingState } from '../LoadingState';
import useSpreadState from '../../hooks/useSpreadState';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { forkJoin } from 'rxjs';
import { fetchContentByCommitId } from '../../services/content';
import { fromString } from '../../utils/xml';
import { parseContentXML } from '../../utils/content';
import { ApiResponseErrorState } from '../ApiResponseErrorState';

export function CompareVersionsDialogContainer(props: CompareVersionsDialogContainerProps) {
  const { selectedA, selectedB, versionsBranch, disableItemSwitching = false, contentTypesBranch, compareXml } = props;
  const { count, page, limit, selected, compareVersionsBranch, current, item, rootPath } = versionsBranch;
  const [openSelector, setOpenSelector] = useState(false);
  const dispatch = useDispatch();
  const compareMode = selectedA && selectedB;
  const [selectionContent, setSelectionContent] = useSpreadState({
    contentA: null,
    contentB: null,
    contentAXml: null,
    contentBXml: null
  });
  const siteId = useActiveSiteId();
  const isCompareDataReady =
    compareVersionsBranch?.compareVersions &&
    contentTypesBranch?.byId &&
    item?.contentTypeId &&
    selectionContent.contentA &&
    selectionContent.contentB;

  useEffect(() => {
    if (selectedA && selectedB) {
      forkJoin([
        fetchContentByCommitId(siteId, selectedA.path, selectedA.versionNumber),
        fetchContentByCommitId(siteId, selectedB.path, selectedB.versionNumber)
      ]).subscribe(([contentA, contentB]) => {
        setSelectionContent({
          contentA: parseContentXML(fromString(contentA as string), selectedA.path, contentTypesBranch.byId, {}),
          contentB: parseContentXML(fromString(contentB as string), selectedB.path, contentTypesBranch.byId, {}),
          contentAXml: contentA,
          contentBXml: contentB
        });
      });
    }
  }, [selectedA, selectedB, siteId, setSelectionContent, contentTypesBranch.byId]);

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
      <DialogBody
        sx={{
          overflow: 'auto',
          minHeight: '50vh',
          ...(compareMode && { padding: 0 })
        }}
      >
        {!compareMode && (
          <SingleItemSelector
            sxs={{ root: { marginBottom: '10px' } }}
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
                  content: selectionContent.contentA,
                  xml: selectionContent.contentAXml
                }}
                b={{
                  ...selectedB,
                  ...compareVersionsBranch.compareVersions?.[1],
                  content: selectionContent.contentB,
                  xml: selectionContent.contentBXml
                }}
                contentTypeId={item.contentTypeId}
                contentTypes={contentTypesBranch.byId}
                compareXml={compareXml}
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
              <Typography variant="subtitle1" color="textSecondary" sx={{ lineHeight: '1.5' }}>
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
