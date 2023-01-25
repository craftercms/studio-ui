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

import React, { useEffect, useState } from 'react';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchContentType, fetchLegacyContentTypes } from '../../services/contentTypes';
import useSpreadState from '../../hooks/useSpreadState';
import { ContentTypesLoader } from '../NewContentDialog';
import { EmptyState } from '../EmptyState';
import { FormattedMessage } from 'react-intl';
import { ContentTypesGrid } from '../ContentTypesGrid';
import Paper from '@mui/material/Paper';
import { GlobalAppToolbar } from '../GlobalAppToolbar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import Box from '@mui/material/Box';
import useSubject from '../../hooks/useSubject';
import { debounceTime } from 'rxjs/operators';
import { SearchBar } from '../SearchBar';
import { ApiResponse, ContentType, LegacyContentType } from '../../models';
import { ContentTypeEditor } from '../ContentTypeEditor';
import useContentTypeList from '../../hooks/useContentTypeList';

export interface ContentTypesManagementProps {
  embedded?: boolean;
  showAppsButton?: boolean;
}

export function ContentTypesManagement(props: ContentTypesManagementProps) {
  const { embedded, showAppsButton } = props;
  const siteId = useActiveSiteId();
  const [state, setState] = useSpreadState<{
    contentTypes: LegacyContentType[];
    filteredContentTypes: LegacyContentType[];
    loadingContentTypes: boolean;
    error: ApiResponse;
  }>({
    contentTypes: null,
    filteredContentTypes: null,
    loadingContentTypes: false,
    error: null
  });
  useContentTypeList();
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [selectedContentType, setSelectedContentType] = useState<{
    contentType: LegacyContentType;
    definition: ContentType;
  }>(null);
  const [keyword, setKeyword] = useState('');
  const [debounceKeyword, setDebounceKeyword] = useState('');

  const selectContentType = (selected: LegacyContentType) => {
    setSelectedContentType(null);
    fetchContentType(siteId, selected.name).subscribe((contentType) => {
      setView('editor');
      setSelectedContentType({
        contentType: selected,
        definition: contentType
      });
    });
  };

  useEffect(() => {
    setState({ loadingContentTypes: true });
    fetchLegacyContentTypes(siteId).subscribe({
      next(response) {
        setState({ loadingContentTypes: false, contentTypes: response, error: null });
      },
      error(response) {
        setState({ loadingContentTypes: false, error: response });
      }
    });
  }, [siteId, setState]);

  useEffect(() => {
    if (state.contentTypes) {
      setState({
        filteredContentTypes: state.contentTypes.filter((contentType) =>
          contentType.label.toLowerCase().includes(debounceKeyword.toLowerCase())
        )
      });
    }
  }, [debounceKeyword, setState, state.contentTypes]);

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
    <Paper elevation={0}>
      {view === 'list' ? (
        <>
          <GlobalAppToolbar
            title={!embedded && <FormattedMessage id="GlobalMenu.ContentTypes" defaultMessage="Content Types" />}
            leftContent={
              <Button startIcon={<AddIcon />} variant="outlined" color="primary" onClick={() => null}>
                <FormattedMessage id="ContentTypesManagement.createNewType" defaultMessage="Create New Type" />
              </Button>
            }
            showHamburgerMenuButton={!embedded}
            showAppsButton={showAppsButton}
          />

          <Box sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <SearchBar onChange={onSearch} keyword={keyword} autoFocus showActionButton={Boolean(keyword)} />
              </Box>
            </Box>

            {state.loadingContentTypes && <ContentTypesLoader isCompact={false} />}
            {state.error && <ApiResponseErrorState error={state.error} />}
            {state.filteredContentTypes?.length === 0 && (
              <EmptyState
                title={
                  <FormattedMessage
                    id="contentTypesManagement.emptyStateMessage"
                    defaultMessage="No Content Types Found"
                  />
                }
              />
            )}
            {state.filteredContentTypes?.length > 0 && (
              <ContentTypesGrid
                filterContentTypes={state.filteredContentTypes}
                isCompact={true}
                onTypeOpen={selectContentType}
              />
            )}
          </Box>
        </>
      ) : (
        <ContentTypeEditor contentType={selectedContentType.contentType} definition={selectedContentType.definition} />
      )}
    </Paper>
  );
}

export default ContentTypesManagement;
