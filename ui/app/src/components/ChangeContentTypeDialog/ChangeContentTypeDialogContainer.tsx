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

import { ChangeContentTypeDialogContainerProps } from './utils';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useDispatch } from 'react-redux';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { LegacyContentType } from '../../models/ContentType';
import { fetchLegacyContentTypes } from '../../services/contentTypes';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useSubject } from '../../hooks/useSubject';
import { debounceTime } from 'rxjs/operators';
import DialogBody from '../DialogBody/DialogBody';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import SingleItemSelector from '../SingleItemSelector';
import { FormattedMessage } from 'react-intl';
import SearchBar from '../SearchBar/SearchBar';
import { ContentTypesGrid, ContentTypesLoader } from '../NewContentDialog';
import DialogFooter from '../DialogFooter/DialogFooter';
import { makeStyles } from 'tss-react/mui';
import EmptyState from '../EmptyState';

const useStyles = makeStyles()(() => ({
  compact: {
    marginRight: 'auto',
    paddingLeft: '20px'
  },
  dialogContent: {
    minHeight: 455
  },
  searchBox: {
    minWidth: '33%'
  },
  emptyStateImg: {
    width: 250,
    marginBottom: 17
  }
}));

export function ChangeContentTypeDialogContainer(props: ChangeContentTypeDialogContainerProps) {
  const { item, onContentTypeSelected, compact = false, rootPath, selectedContentType } = props;
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const { classes } = useStyles();

  const [isCompact, setIsCompact] = useState(compact);
  const [openSelector, setOpenSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState(item);
  const [contentTypes, setContentTypes] = useState<LegacyContentType[]>();
  const [isFetching, setIsFetching] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [debounceKeyword, setDebounceKeyword] = useState('');
  const filteredContentTypes = useMemo(() => {
    const lowercaseKeyword = debounceKeyword.toLowerCase();
    return contentTypes?.filter((contentType) => contentType.label.toLowerCase().includes(lowercaseKeyword));
  }, [contentTypes, debounceKeyword]);

  const onSelectedContentType = (contentType: LegacyContentType) => {
    onContentTypeSelected?.({
      newContentTypeId: contentType.form
    });
  };

  useEffect(() => {
    if (selectedItem.path) {
      setIsFetching(true);
      const sub = fetchLegacyContentTypes(site, selectedItem.path).subscribe({
        next: (response) => {
          setIsFetching(false);
          setContentTypes(
            response.filter(
              (contentType) =>
                contentType.type === selectedItem.systemType && contentType.name !== selectedItem.contentTypeId
            )
          );
        },
        error: (response) => {
          setIsFetching(false);
          dispatch(showErrorDialog({ error: response }));
        }
      });
      return () => {
        sub.unsubscribe();
      };
    }
  }, [dispatch, selectedItem, site]);

  const onSearch$ = useSubject<string>();

  useEffect(() => {
    onSearch$.pipe(debounceTime(400)).subscribe((keywords) => {
      setDebounceKeyword(keywords);
    });
  });

  const onSearch = (keyword: string) => {
    onSearch$.next(keyword);
    setKeyword(keyword);
  };

  return (
    <>
      <DialogBody classes={{ root: classes.dialogContent }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <SingleItemSelector
              label={<FormattedMessage id="words.item" defaultMessage="Item" />}
              open={openSelector}
              onClose={() => setOpenSelector(false)}
              onDropdownClick={() => setOpenSelector(!openSelector)}
              rootPath={rootPath}
              selectedItem={selectedItem}
              onItemClicked={(item) => {
                setOpenSelector(false);
                setSelectedItem(item);
              }}
            />
          </Box>
          <Box className={classes.searchBox}>
            <SearchBar onChange={onSearch} keyword={keyword} autoFocus showActionButton={Boolean(keyword)} />
          </Box>
        </Box>
        {isFetching ? (
          <ContentTypesLoader numOfItems={6} isCompact={isCompact} />
        ) : filteredContentTypes ? (
          filteredContentTypes.length > 0 ? (
            <Suspense fallback="">
              <ContentTypesGrid
                contentTypes={filteredContentTypes}
                isCompact={isCompact}
                onTypeOpen={onSelectedContentType}
                selectedContentType={selectedContentType}
              />
            </Suspense>
          ) : (
            <EmptyState
              title={
                <FormattedMessage
                  id="changeContentTypeDialog.emptyStateMessage"
                  defaultMessage="No Content Types Found"
                />
              }
              classes={{
                image: classes.emptyStateImg
              }}
            />
          )
        ) : (
          <></>
        )}
      </DialogBody>
      <DialogFooter>
        <FormControlLabel
          className={classes.compact}
          control={<Checkbox checked={isCompact} onChange={() => setIsCompact(!isCompact)} color="primary" />}
          label={<FormattedMessage id="words.compact" defaultMessage="Compact" />}
        />
      </DialogFooter>
    </>
  );
}

export default ChangeContentTypeDialogContainer;
